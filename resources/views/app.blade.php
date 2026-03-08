<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'PrimeVolt Electric') }}</title>

    <!-- SEO Meta Tags -->
    <meta name="description" content="PrimeVolt Electric Co. Ltd - Leading electrical contractor in Tanzania. Specializing in electrical installation, HVAC systems, ICT services, and land investment opportunities.">
    <meta name="keywords" content="electrical contractor Tanzania, HVAC systems, ICT services, land investment Tanzania, Mikumi, electrical installation Dar es Salaam">
    <meta name="author" content="PrimeVolt Electric Co. Ltd">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="PrimeVolt Electric Co. Ltd - Electrical Contractor Tanzania">
    <meta property="og:description" content="Leading electrical contractor in Tanzania. Specializing in electrical installation, HVAC systems, ICT services, and land investment opportunities.">
    <meta property="og:image" content="{{ asset('prime-logo.png') }}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="PrimeVolt Electric Co. Ltd - Electrical Contractor Tanzania">
    <meta property="twitter:description" content="Leading electrical contractor in Tanzania. Specializing in electrical installation, HVAC systems, ICT services, and land investment opportunities.">
    <meta property="twitter:image" content="{{ asset('prime-logo.png') }}">

    <!-- Favicons -->
    <link rel="icon" type="image/png" href="/prime-logo.png">
    <link rel="apple-touch-icon" href="/prime-logo.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="msapplication-TileColor" content="#2E7D32">
    <meta name="msapplication-TileImage" content="/prime-logo.png">
    <meta name="theme-color" content="#2E7D32">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead

    <!-- Structured Data (Schema.org) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PrimeVolt Electric Co. Ltd",
        "url": "{{ url('/') }}",
        "logo": "{{ asset('prime-logo.png') }}",
        "description": "Leading electrical contractor in Tanzania specializing in electrical installation, HVAC systems, ICT services, and land investment opportunities.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dar es Salaam",
            "addressCountry": "Tanzania"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "url": "{{ url('/contact') }}"
        },
        "sameAs": [
            "{{ $settings['facebook'] ?? '' }}",
            "{{ $settings['twitter'] ?? '' }}",
            "{{ $settings['linkedin'] ?? '' }}",
            "{{ $settings['instagram'] ?? '' }}"
        ]
    }
    </script>
</head>

<body class="font-sans antialiased">
    @inertia

    @php
    $settings = \App\Models\Setting::getAllSettings();
    $tawkEnabled = ($settings['tawk_enabled'] ?? '0') === '1';
    $tawkId = $settings['tawk_id'] ?? '';
    @endphp

    @if($tawkEnabled && $tawkId)
    <!--Start of Tawk.to Script-->
    <script type="text/javascript">
        var Tawk_API = Tawk_API || {},
            Tawk_LoadStart = new Date();
        (function() {
            var s1 = document.createElement("script"),
                s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/{{ $tawkId }}';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
        })();
    </script>
    <!--End of Tawk.to Script-->
    @endif
</body>

</html>