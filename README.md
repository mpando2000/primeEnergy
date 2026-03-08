# Sumajkt Electric Co. Ltd - Company Website

A modern company website for Sumajkt Electric Co. Ltd, an electrical contractor based in Tanzania. Built with Laravel, Inertia.js, React, and Tailwind CSS.

## Features

- **Public Website**: Home, About, Services, Land Investments, Projects, Training, Chairman's Message, Contact pages
- **Multi-language Support**: English and Swahili with database-driven translations
- **Auto-Translation**: Projects and Services auto-translate between EN/SW using Google Translate API
- **Admin Panel**: Dashboard with collapsible sidebar, dark/light mode toggle
- **Projects Management**: Full CRUD for company projects with image galleries and auto-translation
- **Land Investments**: Showcase prime land opportunities for hotels, tourist camps, and commercial developments
- **Services Management**: Manage services and sub-services with auto-translation
- **Training Gallery**: Manage training photos
- **Messages System**: Receive and manage contact form submissions with role-based access
- **User Management**: Admin can create/edit/delete users with roles (admin, editor, viewer)
- **Profile Management**: Users can update profile info, change password, and upload avatar
- **Notifications System**: Real-time notifications for new messages, projects, services, etc.
- **Content Management**: Edit all website text content from admin panel
- **Dynamic Settings**: Admin can update company info, contact details, social media, and theme colors
- **Responsive Design**: Mobile-friendly layout
- **Theme Customization**: Colors can be changed from admin panel and reflect across the entire website

## Tech Stack

- **Backend**: Laravel 11, PHP 8.2+
- **Frontend**: React 18, TypeScript, Inertia.js
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Build Tool**: Vite

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL 8.0+

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sumajkt-website.git
cd sumajkt-website
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node.js dependencies

```bash
npm install
```

### 4. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
APP_NAME="Sumajkt Electric"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sumajkt
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Create Database

Create a MySQL database named `sumajkt` (or your preferred name):

```sql
CREATE DATABASE sumajkt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 7. Run Migrations

```bash
php artisan migrate
```

### 8. Create Storage Symlink

This is required for uploaded images to be accessible:

```bash
php artisan storage:link
```

### 9. Create Admin User

Run tinker to create an admin user:

```bash
php artisan tinker
```

Then execute:

```php
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@sumajkt.co.tz',
    'password' => bcrypt('admin123'),
    'role' => 'admin',
    'status' => 'active',
]);
```

Type `exit` to leave tinker.

### 10. Seed Initial Settings (Optional)

You can add default settings via tinker:

```bash
php artisan tinker
```

```php
\App\Models\Setting::set('company_name', 'Sumajkt Electric Co. Ltd');
\App\Models\Setting::set('email', 'info@sumajkt.co.tz');
\App\Models\Setting::set('phone', '+255 22 286 2251');
\App\Models\Setting::set('address', 'Dar es Salaam, Tanzania');
\App\Models\Setting::set('primary_color', '#2E7D32');
\App\Models\Setting::set('secondary_color', '#1B5E20');
\App\Models\Setting::set('accent_color', '#FBC02D');
\App\Models\Setting::set('highlight_color', '#E53935');
```

Type `exit` to leave tinker.

### 11. Import Translations (IMPORTANT)

The website uses database-driven translations. You must import the translations for the website to display properly.

**Option A: Import from JSON files (Recommended)**

```bash
php artisan tinker
```

```php
App\Models\Translation::importFromJson('en', resource_path('js/translations/en.json'));
App\Models\Translation::importFromJson('sw', resource_path('js/translations/sw.json'));
exit
```

**Option B: Run migrations (includes About page translations)**

The migrations automatically seed translations for the About page sections (Team, Philosophy, Careers, Policies).

After running migrations, clear the cache:

```bash
php artisan cache:clear
```

**Troubleshooting Translation Issues:**

If you see raw translation keys like `about.philosophy.title` instead of actual text:

1. **Check if translations exist in database:**
```bash
php artisan tinker
```
```php
App\Models\Translation::where('key', 'like', 'philosophy%')->where('group', 'about')->count();
// Should return > 0
```

2. **Clear the translation cache:**
```bash
php artisan cache:clear
```

3. **If translations are missing, re-run the About page migration:**
```bash
php artisan migrate:rollback --step=1
php artisan migrate
php artisan cache:clear
```

4. **Or manually import About page translations:**
```bash
php artisan tinker
```
```php
// The migration 2024_12_24_000003_add_about_page_translations.php 
// seeds all About page translations automatically
exit
```

### 12. Configure Google Translate API (Optional - for Auto-Translation)

For automatic translation of Projects and Services between English and Swahili:

1. Get a Google Cloud Translation API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to your `.env` file:

```env
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

Without this key, auto-translation will be skipped and you'll need to manually enter both language versions.

### 13. Configure PHP Settings (Important for Image Uploads)

For image uploads to work properly, update your `php.ini` file:

```ini
upload_max_filesize = 10M
post_max_size = 10M
memory_limit = 256M
max_execution_time = 120
```

To find your php.ini location:
```bash
php --ini
```

After editing, restart your web server or PHP-FPM.

### 14. Build Frontend Assets

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
```

### 15. Start the Development Server

In one terminal, run the Laravel server:

```bash
php artisan serve
```

In another terminal, run Vite for hot-reloading (development only):

```bash
npm run dev
```

Visit `http://localhost:8000` in your browser.

## Admin Panel Access

- **URL**: `http://localhost:8000/admin/login`
- **Default Credentials**:
  - Email: `admin@sumajkt.co.tz`
  - Password: `admin123`

> ⚠️ **Important**: Change the default password after first login!

## Quick Start Commands

After cloning, run these commands in order:

```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database (edit .env first with your MySQL credentials)
php artisan migrate
php artisan storage:link

# Create admin user
php artisan tinker
# Then run: \App\Models\User::create(['name' => 'Admin', 'email' => 'admin@sumajkt.co.tz', 'password' => bcrypt('admin123'), 'role' => 'admin', 'status' => 'active']);
# Type: exit

# Import translations (IMPORTANT - prevents "about.philosophy.title" issues)
php artisan tinker
# Then run: App\Models\Translation::importFromJson('en', resource_path('js/translations/en.json'));
# Then run: App\Models\Translation::importFromJson('sw', resource_path('js/translations/sw.json'));
# Type: exit

# Clear cache
php artisan cache:clear

# Build and run
npm run build
php artisan serve
```

## Project Structure

```
├── app/
│   ├── Http/Controllers/
│   │   ├── ProjectController.php       # Projects CRUD + auto-translation
│   │   ├── ServiceController.php       # Services & Sub-services CRUD + auto-translation
│   │   ├── TrainingController.php      # Training photos CRUD
│   │   ├── MessageController.php       # Contact messages management
│   │   ├── UserController.php          # User management
│   │   ├── AdminProfileController.php  # User profile & avatar management
│   │   ├── TranslationController.php   # Content translations management
│   │   ├── NotificationController.php  # Notifications management
│   │   ├── HomeController.php          # Home page with dynamic services
│   │   └── SettingController.php       # Settings management
│   ├── Models/
│   │   ├── Project.php                 # Project model with translations
│   │   ├── Service.php                 # Service model with translations
│   │   ├── SubService.php              # Sub-service model with translations
│   │   ├── Training.php                # Training model
│   │   ├── Message.php                 # Message model
│   │   ├── Translation.php             # Translation model for website content
│   │   ├── Notification.php            # Notification model
│   │   ├── User.php                    # User model with roles & avatar
│   │   └── Setting.php                 # Key-value settings with caching
│   └── Services/
│       └── TranslatorService.php       # Google Translate API integration
├── database/migrations/
│   ├── *_create_projects_table.php
│   ├── *_create_services_tables.php
│   ├── *_create_trainings_table.php
│   ├── *_create_messages_table.php
│   ├── *_create_notifications_table.php
│   ├── *_create_translations_table.php
│   ├── *_add_translations_to_projects_table.php
│   ├── *_add_translations_to_services_tables.php
│   ├── *_add_avatar_to_users_table.php
│   ├── *_add_role_status_to_users_table.php
│   └── *_create_settings_table.php
├── resources/
│   ├── js/
│   │   ├── contexts/
│   │   │   └── LanguageContext.tsx     # Language switching context
│   │   ├── Layouts/
│   │   │   ├── MainLayout.tsx          # Public site layout with language toggle
│   │   │   └── AdminLayout.tsx         # Admin panel layout with notifications
│   │   └── Pages/
│   │       ├── Home.tsx, About.tsx, etc.  # Public pages
│   │       └── Admin/
│   │           ├── Dashboard.tsx       # Admin dashboard
│   │           ├── Projects.tsx        # Projects management with language selector
│   │           ├── Services.tsx        # Services management with language selector
│   │           ├── Content.tsx         # Website content/translations editor
│   │           ├── Profile.tsx         # User profile management
│   │           └── ...                 # Other admin pages
│   └── css/
│       ├── app.css                     # Main styles + theme variables
│       └── admin.css                   # Admin panel styles
├── routes/
│   └── web.php                         # All routes
├── storage/
│   └── app/public/
│       ├── projects/                   # Uploaded project images
│       ├── trainings/                  # Uploaded training images
│       └── avatars/                    # User profile pictures
└── public/
    └── storage -> ../storage/app/public  # Symlink for uploads
```

## Theme Customization

The website uses CSS variables for theming. Colors can be changed from:

**Admin Panel → Settings → Appearance**

Available color settings:
- Primary Color (default: #2E7D32 - Green)
- Secondary Color (default: #1B5E20 - Dark Green)
- Accent Color (default: #FBC02D - Yellow)
- Highlight Color (default: #E53935 - Red)

Changes apply immediately across all pages.

## Multi-Language Support

The website supports English (EN) and Swahili (SW) languages.

### Static Content (Website Text)
- Managed via **Admin Panel → Content**
- All website text (headings, descriptions, buttons) stored in database
- Edit content for both languages from one interface
- Changes cached for performance

### Dynamic Content (Projects & Services)
- When creating/editing projects or services, select your preferred language
- Content auto-translates to the other language on save (requires Google Translate API key)
- Switch between EN/SW in the editor to view/edit each language version
- Public pages display content in user's selected language

### Language Switching
- Users can switch language using the toggle in the website header
- Language preference stored in browser localStorage
- All content updates immediately without page reload

## Image Upload

Projects support two methods for adding images:
1. **URL**: Paste image URLs from external sources (e.g., Unsplash)
2. **File Upload**: Upload images from your device (max 8MB per file)

Uploaded images are stored in `storage/app/public/projects/` and served via the `/storage` URL.

## Available Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/about` | About Us |
| `/services` | Our Services |
| `/investments` | Land Investment Opportunities |
| `/projects` | Projects List |
| `/projects/{id}` | Project Detail |
| `/training` | Staff Training |
| `/chairman` | Chairman's Message |
| `/contact` | Contact Us |

### Admin Routes
| Route | Description |
|-------|-------------|
| `/login` | Admin Login |
| `/admin` | Dashboard |
| `/admin/projects` | Manage Projects |
| `/admin/services` | Manage Services |
| `/admin/investments` | Manage Land Investments |
| `/admin/training` | Manage Training |
| `/admin/gallery` | Manage Gallery |
| `/admin/content` | Manage Website Content/Translations |
| `/admin/messages` | View Messages |
| `/admin/profile` | User Profile & Avatar |
| `/admin/users` | Manage Users (Admin only) |
| `/admin/settings` | Site Settings (Admin only) |

## User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access - can manage all content, users, and settings |
| `editor` | Can manage content (projects, services, training, gallery) |
| `viewer` | Read-only access to admin panel |

**Note**: Only admin users can access Settings and User Management sections.

## Troubleshooting

### Translation Keys Showing Instead of Text (e.g., "about.philosophy.title")

This is the most common issue after cloning. The translations are stored in the database and need to be imported.

**Solution:**

```bash
# Step 1: Import translations from JSON files
php artisan tinker
```

```php
App\Models\Translation::importFromJson('en', resource_path('js/translations/en.json'));
App\Models\Translation::importFromJson('sw', resource_path('js/translations/sw.json'));
exit
```

```bash
# Step 2: Clear the cache
php artisan cache:clear
```

```bash
# Step 3: Refresh the page (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
```

If the issue persists for About page sections (Team, Philosophy, Careers, Policies):

```bash
# Re-run the About page translations migration
php artisan migrate:refresh --path=database/migrations/2024_12_24_000003_add_about_page_translations.php
php artisan cache:clear
```

### Images not uploading
- Check PHP settings: `upload_max_filesize`, `post_max_size`, `memory_limit`
- Ensure `storage/app/public/projects` directory exists and is writable
- Run `php artisan storage:link` if images don't display

### 419 Page Expired Error
- Clear browser cache and cookies
- Run `php artisan cache:clear`

### Styles not updating
- Run `npm run build` for production
- Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Database connection issues
- Verify MySQL is running
- Check `.env` database credentials
- Ensure database exists

## Development

### Clear All Caches

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Running Tests

```bash
php artisan test
```

### Building for Production

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Deployment Checklist

1. Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
2. Run `composer install --optimize-autoloader --no-dev`
3. Run `npm run build`
4. Run Laravel optimization commands
5. Set up your web server (Nginx/Apache) to point to `/public`
6. Ensure `storage/` and `bootstrap/cache/` are writable
7. Configure PHP settings for file uploads
8. Set up SSL certificate for HTTPS

## License

This project is proprietary software for Sumajkt Electric Co. Ltd.

## Support

For technical support, contact the development team.
