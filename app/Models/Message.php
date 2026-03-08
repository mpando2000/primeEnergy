<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'body',
        'recipient_email',
        'read',
        'starred',
        'archived',
        'replied',
        'replied_at',
        'replied_by',
        'reply_content',
    ];

    protected $casts = [
        'read' => 'boolean',
        'starred' => 'boolean',
        'archived' => 'boolean',
        'replied' => 'boolean',
        'replied_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function replies(): HasMany
    {
        return $this->hasMany(MessageReply::class)->orderBy('created_at', 'asc');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }

    public function getInitialsAttribute(): string
    {
        $words = explode(' ', $this->name);
        $initials = '';
        foreach (array_slice($words, 0, 2) as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
        }
        return $initials;
    }

    public function getExcerptAttribute(): string
    {
        return strlen($this->body) > 100 
            ? substr($this->body, 0, 100) . '...' 
            : $this->body;
    }

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeNotArchived($query)
    {
        return $query->where('archived', false);
    }

    public function scopeReplied($query)
    {
        return $query->where('replied', true);
    }

    public function scopeNotReplied($query)
    {
        return $query->where('replied', false);
    }
}
