<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->read = true;
        $notification->save();

        return redirect()->back();
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        Notification::forUser($user->id, $isAdmin)->unread()->update(['read' => true]);

        return redirect()->back();
    }
}
