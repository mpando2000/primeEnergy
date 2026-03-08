<?php

namespace App\Http\Controllers;

use App\Mail\MessageReply as MessageReplyMail;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\MessageReply;
use App\Models\Notification;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        $query = Message::with(['replies.attachments', 'attachments'])
            ->withCount('replies')
            ->notArchived()
            ->orderBy('created_at', 'desc');
        
        if (!$isAdmin) {
            $query->where('recipient_email', $user->email);
        }

        $messages = $query->get()->map(function ($message) {
            return [
                'id' => $message->id,
                'name' => $message->name,
                'initials' => $message->initials,
                'email' => $message->email,
                'phone' => $message->phone,
                'subject' => $message->subject,
                'excerpt' => $message->excerpt,
                'body' => $message->body,
                'recipient_email' => $message->recipient_email,
                'read' => $message->read,
                'starred' => $message->starred,
                'replied' => $message->replied,
                'replied_at' => $message->replied_at?->toISOString(),
                'replied_by' => $message->replied_by,
                'replies_count' => $message->replies_count,
                'created_at' => $message->created_at->toISOString(),
                'date' => $message->created_at->diffForHumans(),
                'dateFormatted' => $message->created_at->format('M d, Y \a\t g:i A'),
                'attachments' => $message->attachments->map(fn($a) => [
                    'id' => $a->id,
                    'name' => $a->original_name,
                    'size' => $a->formatted_size,
                    'icon' => $a->icon,
                    'url' => $a->url,
                ]),
                'replies' => $message->replies->map(fn($r) => [
                    'id' => $r->id,
                    'sender_type' => $r->sender_type,
                    'sender_name' => $r->sender_name,
                    'sender_email' => $r->sender_email,
                    'body' => $r->body,
                    'is_internal_note' => $r->is_internal_note,
                    'created_at' => $r->created_at->toISOString(),
                    'date' => $r->created_at->diffForHumans(),
                    'dateFormatted' => $r->created_at->format('M d, Y \a\t g:i A'),
                    'attachments' => $r->attachments->map(fn($a) => [
                        'id' => $a->id,
                        'name' => $a->original_name,
                        'size' => $a->formatted_size,
                        'icon' => $a->icon,
                        'url' => $a->url,
                    ]),
                ]),
            ];
        });

        $settings = Setting::getAllSettings();

        return Inertia::render('Admin/Messages', [
            'messages' => $messages,
            'isAdmin' => $isAdmin,
            'companyEmail' => $settings['email'] ?? config('mail.from.address'),
            'companyName' => $settings['company_name'] ?? config('app.name'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'recipient_email' => 'nullable|email',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        $message = Message::create($validated);
        
        // Handle attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('message-attachments', 'public');
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'filename' => basename($path),
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'path' => $path,
                ]);
            }
        }
        
        Notification::notify('message', 'New message from ' . $message->name, [
            'body' => $message->subject,
            'link' => '/admin/messages',
        ]);

        return redirect()->back()->with('success', 'Message sent successfully');
    }

    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'reply' => 'required|string|min:10',
            'is_internal_note' => 'boolean',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
        ]);

        $message = Message::findOrFail($id);
        $user = $request->user();
        $isInternalNote = $validated['is_internal_note'] ?? false;
        
        $settings = Setting::getAllSettings();
        $companyEmail = $settings['email'] ?? config('mail.from.address');

        // Create the reply record
        $reply = MessageReply::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'sender_type' => 'admin',
            'sender_name' => $user->name,
            'sender_email' => $companyEmail,
            'body' => $validated['reply'],
            'is_internal_note' => $isInternalNote,
        ]);

        // Handle attachments
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('message-attachments', 'public');
                $attachment = MessageAttachment::create([
                    'reply_id' => $reply->id,
                    'filename' => basename($path),
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'path' => $path,
                ]);
                $attachmentPaths[] = [
                    'path' => Storage::disk('public')->path($path),
                    'name' => $file->getClientOriginalName(),
                ];
            }
        }

        // Only send email if not an internal note
        if (!$isInternalNote) {
            try {
                Mail::to($message->email)
                    ->send(new MessageReplyMail(
                        originalMessage: $message,
                        replyBody: $validated['reply'],
                        senderName: $user->name,
                        senderEmail: $companyEmail,
                        attachments: $attachmentPaths,
                    ));

                $message->update([
                    'replied' => true,
                    'replied_at' => now(),
                    'replied_by' => $user->name,
                ]);

                return redirect()->back()->with('success', 'Reply sent to ' . $message->email);
            } catch (\Exception $e) {
                return redirect()->back()->with('error', 'Reply saved but email failed: ' . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', 'Internal note added');
    }

    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('message-attachments', 'public');

        return response()->json([
            'filename' => basename($path),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }

    public function downloadAttachment($id)
    {
        $attachment = MessageAttachment::findOrFail($id);
        return Storage::disk('public')->download($attachment->path, $attachment->original_name);
    }

    public function markAsRead($id)
    {
        $message = Message::findOrFail($id);
        $message->read = true;
        $message->save();

        return redirect()->back();
    }

    public function toggleStar($id)
    {
        $message = Message::findOrFail($id);
        $message->starred = !$message->starred;
        $message->save();

        return redirect()->back();
    }

    public function archive($id)
    {
        $message = Message::findOrFail($id);
        $message->archived = true;
        $message->save();

        return redirect()->back()->with('success', 'Message archived');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Only administrators can delete messages');
        }

        $message = Message::findOrFail($id);
        
        // Delete attachments from storage
        foreach ($message->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->path);
        }
        foreach ($message->replies as $reply) {
            foreach ($reply->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->path);
            }
        }
        
        $message->delete();

        return redirect()->back()->with('success', 'Message deleted');
    }
}
