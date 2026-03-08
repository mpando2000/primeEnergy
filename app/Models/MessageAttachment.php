<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MessageAttachment extends Model
{
    protected $fillable = [
        'message_id',
        'reply_id',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'path',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function reply(): BelongsTo
    {
        return $this->belongsTo(MessageReply::class, 'reply_id');
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }

    public function getIconAttribute(): string
    {
        $type = explode('/', $this->mime_type)[0];
        $ext = pathinfo($this->original_name, PATHINFO_EXTENSION);
        
        return match(true) {
            $type === 'image' => 'fa-file-image',
            $type === 'video' => 'fa-file-video',
            $type === 'audio' => 'fa-file-audio',
            in_array($ext, ['pdf']) => 'fa-file-pdf',
            in_array($ext, ['doc', 'docx']) => 'fa-file-word',
            in_array($ext, ['xls', 'xlsx']) => 'fa-file-excel',
            in_array($ext, ['ppt', 'pptx']) => 'fa-file-powerpoint',
            in_array($ext, ['zip', 'rar', '7z']) => 'fa-file-archive',
            default => 'fa-file',
        };
    }
}
