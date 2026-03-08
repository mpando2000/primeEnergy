<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'title',
        'body',
        'icon',
        'icon_bg',
        'link',
        'user_id',
        'actor_id',
        'read',
    ];

    protected $casts = [
        'read' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeForUser($query, $userId, $isAdmin = false)
    {
        if ($isAdmin) {
            // Admin sees notifications targeted to them OR global notifications (user_id = null)
            return $query->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)->orWhereNull('user_id');
            });
        }
        // Non-admin only sees notifications targeted to them
        return $query->where('user_id', $userId);
    }

    // Helper to create notifications
    public static function notify(string $type, string $title, array $options = []): self
    {
        return self::create([
            'type' => $type,
            'title' => $title,
            'body' => $options['body'] ?? null,
            'icon' => $options['icon'] ?? self::getIconForType($type),
            'icon_bg' => $options['icon_bg'] ?? self::getColorForType($type),
            'link' => $options['link'] ?? null,
            'user_id' => $options['user_id'] ?? null,
            'actor_id' => $options['actor_id'] ?? null,
        ]);
    }

    private static function getIconForType(string $type): string
    {
        return match ($type) {
            'message' => 'fa-envelope',
            'user_created' => 'fa-user-plus',
            'project' => 'fa-project-diagram',
            'service' => 'fa-cogs',
            'training' => 'fa-graduation-cap',
            default => 'fa-bell',
        };
    }

    private static function getColorForType(string $type): string
    {
        return match ($type) {
            'message' => '#2196F3',
            'user_created' => '#9C27B0',
            'project' => '#FF9800',
            'service' => '#4CAF50',
            'training' => '#E91E63',
            default => '#2E7D32',
        };
    }
}
