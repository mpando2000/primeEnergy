<?php

namespace App\Mail;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class MessageReply extends Mailable
{
    use Queueable, SerializesModels;

    public Message $originalMessage;
    public string $replyBody;
    public string $senderName;
    public string $senderEmail;
    public array $fileAttachments;

    public function __construct(
        Message $originalMessage,
        string $replyBody,
        string $senderName,
        string $senderEmail,
        array $attachments = [],
    ) {
        $this->originalMessage = $originalMessage;
        $this->replyBody = $replyBody;
        $this->senderName = $senderName;
        $this->senderEmail = $senderEmail;
        $this->fileAttachments = $attachments;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address($this->senderEmail, $this->senderName),
            replyTo: [new Address($this->senderEmail, $this->senderName)],
            subject: 'Re: ' . $this->originalMessage->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.message-reply',
        );
    }

    public function attachments(): array
    {
        $mailAttachments = [];
        
        foreach ($this->fileAttachments as $attachment) {
            if (isset($attachment['path']) && file_exists($attachment['path'])) {
                $mailAttachments[] = Attachment::fromPath($attachment['path'])
                    ->as($attachment['name'] ?? basename($attachment['path']));
            }
        }
        
        return $mailAttachments;
    }
}
