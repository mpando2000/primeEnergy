<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Re: {{ $originalMessage->subject }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #4671b0 0%, #2b4c7e 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .content {
            background: #fff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
        }

        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .message-body {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            white-space: pre-wrap;
        }

        .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }

        .original-message {
            margin-top: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-left: 4px solid #4671b0;
            border-radius: 4px;
        }

        .original-message h4 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 14px;
        }

        .original-message .meta {
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
        }

        .original-message .body {
            color: #666;
            font-size: 14px;
            white-space: pre-wrap;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 12px;
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            background: #fafafa;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>PrimeVolt Electric Co. Ltd</h1>
    </div>

    <div class="content">
        <p class="greeting">Dear {{ $originalMessage->name }},</p>

        <div class="message-body">{{ $replyBody }}</div>

        <div class="signature">
            <p>Best regards,</p>
            <p><strong>{{ $senderName }}</strong><br>
                PrimeVolt Electric Co. Ltd</p>
        </div>

        <div class="original-message">
            <h4>Original Message:</h4>
            <div class="meta">
                From: {{ $originalMessage->name }} &lt;{{ $originalMessage->email }}&gt;<br>
                Subject: {{ $originalMessage->subject }}<br>
                Date: {{ $originalMessage->created_at->format('M d, Y \a\t g:i A') }}
            </div>
            <div class="body">{{ $originalMessage->body }}</div>
        </div>
    </div>

    <div class="footer">
        <p>This email was sent from PrimeVolt Electric Co. Ltd</p>
        <p>Dar es Salaam, Tanzania</p>
    </div>
</body>

</html>