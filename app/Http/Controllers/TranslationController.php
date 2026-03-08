<?php

namespace App\Http\Controllers;

use App\Models\Translation;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TranslationController extends Controller
{
    protected TranslationService $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Content structure definition for the editor
     */
    private function getContentStructure(): array
    {
        return [
            'nav' => [
                'label' => 'Navigation',
                'icon' => 'fa-compass',
                'sections' => [
                    'menu' => [
                        'label' => 'Menu Items',
                        'fields' => [
                            'home' => ['label' => 'Home', 'type' => 'text'],
                            'about' => ['label' => 'About Us', 'type' => 'text'],
                            'services' => ['label' => 'Our Services', 'type' => 'text'],
                            'projects' => ['label' => 'Our Projects', 'type' => 'text'],
                            'training' => ['label' => 'Staff Training', 'type' => 'text'],
                            'contact' => ['label' => 'Contact Us', 'type' => 'text'],
                            'login' => ['label' => 'Login Button', 'type' => 'text'],
                        ],
                    ],
                ],
            ],
            'home' => [
                'label' => 'Home Page',
                'icon' => 'fa-home',
                'sections' => [
                    'welcome' => [
                        'label' => 'Welcome Section',
                        'fields' => [
                            'welcome.title' => ['label' => 'Welcome Title', 'type' => 'text'],
                            'welcome.p1' => ['label' => 'Paragraph 1', 'type' => 'textarea'],
                            'welcome.p2' => ['label' => 'Paragraph 2', 'type' => 'textarea'],
                            'welcome.p3' => ['label' => 'Paragraph 3', 'type' => 'textarea'],
                        ],
                    ],
                    'chairman' => [
                        'label' => 'Managing Director Preview',
                        'fields' => [
                            'md.title' => ['label' => 'Section Title', 'type' => 'text'],
                            'md.readMore' => ['label' => 'Read More Text', 'type' => 'text'],
                        ],
                    ],
                ],
            ],
            'about' => [
                'label' => 'About Page',
                'icon' => 'fa-info-circle',
                'sections' => [
                    'content' => [
                        'label' => 'About Content',
                        'fields' => [
                            'content.title' => ['label' => 'Page Title', 'type' => 'text'],
                            'content.p1' => ['label' => 'Paragraph 1', 'type' => 'textarea'],
                            'content.p2' => ['label' => 'Paragraph 2', 'type' => 'textarea'],
                            'content.p3' => ['label' => 'Paragraph 3', 'type' => 'textarea'],
                            'content.p4' => ['label' => 'Paragraph 4', 'type' => 'textarea'],
                        ],
                    ],
                    'vision' => [
                        'label' => 'Vision & Mission',
                        'fields' => [
                            'vision.title' => ['label' => 'Vision Title', 'type' => 'text'],
                            'vision.text' => ['label' => 'Vision Text', 'type' => 'textarea'],
                            'mission.title' => ['label' => 'Mission Title', 'type' => 'text'],
                            'mission.text' => ['label' => 'Mission Text', 'type' => 'textarea'],
                        ],
                    ],
                    'coreValues' => [
                        'label' => 'Core Values',
                        'fields' => [
                            'coreValues.title' => ['label' => 'Section Title', 'type' => 'text'],
                            'coreValues.safety.title' => ['label' => 'Safety Title', 'type' => 'text'],
                            'coreValues.safety.description' => ['label' => 'Safety Description', 'type' => 'textarea'],
                            'coreValues.integrity.title' => ['label' => 'Integrity Title', 'type' => 'text'],
                            'coreValues.integrity.description' => ['label' => 'Integrity Description', 'type' => 'textarea'],
                            'coreValues.accountability.title' => ['label' => 'Accountability Title', 'type' => 'text'],
                            'coreValues.accountability.description' => ['label' => 'Accountability Description', 'type' => 'textarea'],
                            'coreValues.people.title' => ['label' => 'People Title', 'type' => 'text'],
                            'coreValues.people.description' => ['label' => 'People Description', 'type' => 'textarea'],
                            'coreValues.environment.title' => ['label' => 'Environment Title', 'type' => 'text'],
                            'coreValues.environment.description' => ['label' => 'Environment Description', 'type' => 'textarea'],
                        ],
                    ],
                    'team' => [
                        'label' => 'Our Team',
                        'fields' => [
                            'team.title' => ['label' => 'Section Title', 'type' => 'text'],
                            'team.description' => ['label' => 'Description', 'type' => 'textarea'],
                            'team.joinTitle' => ['label' => 'Join Us Title', 'type' => 'text'],
                            'team.joinText' => ['label' => 'Join Us Text', 'type' => 'textarea'],
                        ],
                    ],
                    'philosophy' => [
                        'label' => 'Business Philosophy',
                        'fields' => [
                            'philosophy.title' => ['label' => 'Section Title', 'type' => 'text'],
                            'philosophy.description' => ['label' => 'Description', 'type' => 'textarea'],
                            'philosophy.quality.title' => ['label' => 'Quality Title', 'type' => 'text'],
                            'philosophy.quality.text' => ['label' => 'Quality Text', 'type' => 'textarea'],
                            'philosophy.partnership.title' => ['label' => 'Partnership Title', 'type' => 'text'],
                            'philosophy.partnership.text' => ['label' => 'Partnership Text', 'type' => 'textarea'],
                            'philosophy.innovation.title' => ['label' => 'Innovation Title', 'type' => 'text'],
                            'philosophy.innovation.text' => ['label' => 'Innovation Text', 'type' => 'textarea'],
                            'philosophy.sustainable.title' => ['label' => 'Sustainability Title', 'type' => 'text'],
                            'philosophy.sustainable.text' => ['label' => 'Sustainability Text', 'type' => 'textarea'],
                        ],
                    ],
                    'careers' => [
                        'label' => 'Career Opportunities',
                        'fields' => [
                            'careers.title' => ['label' => 'Section Title', 'type' => 'text'],
                            'careers.description' => ['label' => 'Description', 'type' => 'textarea'],
                            'careers.openings' => ['label' => 'Current Openings Title', 'type' => 'text'],
                            'careers.fulltime' => ['label' => 'Full-time Badge', 'type' => 'text'],
                            'careers.multiple' => ['label' => 'Multiple Positions Badge', 'type' => 'text'],
                            'careers.job1.title' => ['label' => 'Job 1 Title', 'type' => 'text'],
                            'careers.job1.description' => ['label' => 'Job 1 Description', 'type' => 'textarea'],
                            'careers.job1.location' => ['label' => 'Job 1 Location', 'type' => 'text'],
                            'careers.job2.title' => ['label' => 'Job 2 Title', 'type' => 'text'],
                            'careers.job2.description' => ['label' => 'Job 2 Description', 'type' => 'textarea'],
                            'careers.job2.location' => ['label' => 'Job 2 Location', 'type' => 'text'],
                            'careers.job3.title' => ['label' => 'Job 3 Title', 'type' => 'text'],
                            'careers.job3.description' => ['label' => 'Job 3 Description', 'type' => 'textarea'],
                            'careers.job3.location' => ['label' => 'Job 3 Location', 'type' => 'text'],
                            'careers.howToApply' => ['label' => 'How to Apply Title', 'type' => 'text'],
                            'careers.applyText' => ['label' => 'Apply Text', 'type' => 'textarea'],
                            'careers.applyNote' => ['label' => 'Apply Note', 'type' => 'textarea'],
                        ],
                    ],
                    'policies' => [
                        'label' => 'Company Policies',
                        'fields' => [
                            'policies.title' => ['label' => 'Section Title', 'type' => 'text'],
                            'policies.description' => ['label' => 'Description', 'type' => 'textarea'],
                            'policies.safety.title' => ['label' => 'Safety Policy Title', 'type' => 'text'],
                            'policies.safety.text' => ['label' => 'Safety Policy Text', 'type' => 'textarea'],
                            'policies.safety.item1' => ['label' => 'Safety Item 1', 'type' => 'text'],
                            'policies.safety.item2' => ['label' => 'Safety Item 2', 'type' => 'text'],
                            'policies.safety.item3' => ['label' => 'Safety Item 3', 'type' => 'text'],
                            'policies.safety.item4' => ['label' => 'Safety Item 4', 'type' => 'text'],
                            'policies.environment.title' => ['label' => 'Environment Policy Title', 'type' => 'text'],
                            'policies.environment.text' => ['label' => 'Environment Policy Text', 'type' => 'textarea'],
                            'policies.environment.item1' => ['label' => 'Environment Item 1', 'type' => 'text'],
                            'policies.environment.item2' => ['label' => 'Environment Item 2', 'type' => 'text'],
                            'policies.environment.item3' => ['label' => 'Environment Item 3', 'type' => 'text'],
                            'policies.environment.item4' => ['label' => 'Environment Item 4', 'type' => 'text'],
                            'policies.ethics.title' => ['label' => 'Ethics Policy Title', 'type' => 'text'],
                            'policies.ethics.text' => ['label' => 'Ethics Policy Text', 'type' => 'textarea'],
                            'policies.ethics.item1' => ['label' => 'Ethics Item 1', 'type' => 'text'],
                            'policies.ethics.item2' => ['label' => 'Ethics Item 2', 'type' => 'text'],
                            'policies.ethics.item3' => ['label' => 'Ethics Item 3', 'type' => 'text'],
                            'policies.ethics.item4' => ['label' => 'Ethics Item 4', 'type' => 'text'],
                            'policies.quality.title' => ['label' => 'Quality Policy Title', 'type' => 'text'],
                            'policies.quality.text' => ['label' => 'Quality Policy Text', 'type' => 'textarea'],
                            'policies.quality.item1' => ['label' => 'Quality Item 1', 'type' => 'text'],
                            'policies.quality.item2' => ['label' => 'Quality Item 2', 'type' => 'text'],
                            'policies.quality.item3' => ['label' => 'Quality Item 3', 'type' => 'text'],
                            'policies.quality.item4' => ['label' => 'Quality Item 4', 'type' => 'text'],
                        ],
                    ],
                ],
            ],
            'md' => [
                'label' => 'Managing Director Page',
                'icon' => 'fa-user-tie',
                'sections' => [
                    'main' => [
                        'label' => 'Main Content',
                        'fields' => [
                            'title' => ['label' => 'Page Title', 'type' => 'text'],
                            'bannerTitle' => ['label' => 'Banner Title', 'type' => 'text'],
                            'quote' => ['label' => 'Quote', 'type' => 'textarea'],
                            'greeting' => ['label' => 'Greeting', 'type' => 'text'],
                            'p1' => ['label' => 'Paragraph 1', 'type' => 'textarea'],
                            'p2' => ['label' => 'Paragraph 2', 'type' => 'textarea'],
                            'p3' => ['label' => 'Paragraph 3', 'type' => 'textarea'],
                            'p4' => ['label' => 'Paragraph 4', 'type' => 'textarea'],
                            'p5' => ['label' => 'Paragraph 5', 'type' => 'textarea'],
                        ],
                    ],
                    'pillars' => [
                        'label' => 'Three Pillars',
                        'fields' => [
                            'pillars.people.title' => ['label' => 'People Title', 'type' => 'text'],
                            'pillars.people.description' => ['label' => 'People Description', 'type' => 'textarea'],
                            'pillars.processes.title' => ['label' => 'Processes Title', 'type' => 'text'],
                            'pillars.processes.description' => ['label' => 'Processes Description', 'type' => 'textarea'],
                            'pillars.partnerships.title' => ['label' => 'Partnerships Title', 'type' => 'text'],
                            'pillars.partnerships.description' => ['label' => 'Partnerships Description', 'type' => 'textarea'],
                        ],
                    ],
                    'signature' => [
                        'label' => 'Signature',
                        'fields' => [
                            'signature.regards' => ['label' => 'Regards Text', 'type' => 'text'],
                            'signature.name' => ['label' => 'Name', 'type' => 'text'],
                            'signature.company' => ['label' => 'Company', 'type' => 'text'],
                        ],
                    ],
                ],
            ],
            'contact' => [
                'label' => 'Contact Page',
                'icon' => 'fa-envelope',
                'sections' => [
                    'form' => [
                        'label' => 'Contact Form',
                        'fields' => [
                            'bannerTitle' => ['label' => 'Banner Title', 'type' => 'text'],
                            'form.title' => ['label' => 'Form Title', 'type' => 'text'],
                            'form.name' => ['label' => 'Name Label', 'type' => 'text'],
                            'form.email' => ['label' => 'Email Label', 'type' => 'text'],
                            'form.phone' => ['label' => 'Phone Label', 'type' => 'text'],
                            'form.subject' => ['label' => 'Subject Label', 'type' => 'text'],
                            'form.message' => ['label' => 'Message Label', 'type' => 'text'],
                            'form.submit' => ['label' => 'Submit Button', 'type' => 'text'],
                        ],
                    ],
                    'info' => [
                        'label' => 'Contact Info',
                        'fields' => [
                            'info.title' => ['label' => 'Info Box Title', 'type' => 'text'],
                            'social.title' => ['label' => 'Social Section Title', 'type' => 'text'],
                            'registrations.title' => ['label' => 'Registrations Title', 'type' => 'text'],
                            'registrations.crb' => ['label' => 'CRB Text', 'type' => 'text'],
                            'registrations.acct' => ['label' => 'ACCT Text', 'type' => 'text'],
                        ],
                    ],
                ],
            ],
            'services' => [
                'label' => 'Services Page',
                'icon' => 'fa-cogs',
                'sections' => [
                    'content' => [
                        'label' => 'Page Content',
                        'fields' => [
                            'pageTitle' => ['label' => 'Page Title', 'type' => 'text'],
                            'sidebar.title' => ['label' => 'Sidebar Title', 'type' => 'text'],
                            'content.title' => ['label' => 'Content Title', 'type' => 'text'],
                            'content.p1' => ['label' => 'Paragraph 1', 'type' => 'textarea'],
                            'content.p2' => ['label' => 'Paragraph 2', 'type' => 'textarea'],
                            'projectsBox.title' => ['label' => 'Projects Box Title', 'type' => 'text'],
                            'projectsBox.text' => ['label' => 'Projects Box Text', 'type' => 'text'],
                        ],
                    ],
                ],
            ],
            'projects' => [
                'label' => 'Projects Page',
                'icon' => 'fa-project-diagram',
                'sections' => [
                    'content' => [
                        'label' => 'Page Content',
                        'fields' => [
                            'pageTitle' => ['label' => 'Page Title', 'type' => 'text'],
                            'sidebar.title' => ['label' => 'Sidebar Title', 'type' => 'text'],
                            'content.title' => ['label' => 'Content Title', 'type' => 'text'],
                            'filters.all' => ['label' => 'All Filter', 'type' => 'text'],
                        ],
                    ],
                ],
            ],
            'training' => [
                'label' => 'Training Page',
                'icon' => 'fa-graduation-cap',
                'sections' => [
                    'main' => [
                        'label' => 'Main Content',
                        'fields' => [
                            'title' => ['label' => 'Page Title', 'type' => 'text'],
                            'intro' => ['label' => 'Introduction', 'type' => 'textarea'],
                        ],
                    ],
                    'cards' => [
                        'label' => 'Feature Cards',
                        'fields' => [
                            'cards.international.title' => ['label' => 'International Title', 'type' => 'text'],
                            'cards.international.description' => ['label' => 'International Description', 'type' => 'textarea'],
                            'cards.safety.title' => ['label' => 'Safety Title', 'type' => 'text'],
                            'cards.safety.description' => ['label' => 'Safety Description', 'type' => 'textarea'],
                            'cards.certified.title' => ['label' => 'Certified Title', 'type' => 'text'],
                            'cards.certified.description' => ['label' => 'Certified Description', 'type' => 'textarea'],
                        ],
                    ],
                ],
            ],
            'footer' => [
                'label' => 'Footer',
                'icon' => 'fa-window-minimize',
                'sections' => [
                    'company' => [
                        'label' => 'Company Column',
                        'fields' => [
                            'company.title' => ['label' => 'Column Title', 'type' => 'text'],
                            'company.home' => ['label' => 'Home Link Text', 'type' => 'text'],
                            'company.about' => ['label' => 'About Link Text', 'type' => 'text'],
                            'company.services' => ['label' => 'Services Link Text', 'type' => 'text'],
                            'company.projects' => ['label' => 'Projects Link Text', 'type' => 'text'],
                            'company.contact' => ['label' => 'Contact Link Text', 'type' => 'text'],
                        ],
                    ],
                    'services' => [
                        'label' => 'Services Column',
                        'fields' => [
                            'services.title' => ['label' => 'Column Title', 'type' => 'text'],
                            'services.electrical' => ['label' => 'Electrical', 'type' => 'text'],
                            'services.hvac' => ['label' => 'HVAC', 'type' => 'text'],
                            'services.ict' => ['label' => 'ICT', 'type' => 'text'],
                            'services.security' => ['label' => 'Security', 'type' => 'text'],
                            'services.distribution' => ['label' => 'Distribution', 'type' => 'text'],
                        ],
                    ],
                    'quickLinks' => [
                        'label' => 'Quick Links Column',
                        'fields' => [
                            'quickLinks.title' => ['label' => 'Column Title', 'type' => 'text'],
                            'quickLinks.about' => ['label' => 'About Link Text', 'type' => 'text'],
                            'quickLinks.projects' => ['label' => 'Projects Link Text', 'type' => 'text'],
                            'quickLinks.training' => ['label' => 'Training Link Text', 'type' => 'text'],
                            'quickLinks.careers' => ['label' => 'Careers Link Text', 'type' => 'text'],
                        ],
                    ],
                    'contact' => [
                        'label' => 'Contact Column',
                        'fields' => [
                            'contact.title' => ['label' => 'Column Title', 'type' => 'text'],
                            'contact.company' => ['label' => 'Company Name', 'type' => 'text'],
                            'contact.location' => ['label' => 'Location', 'type' => 'text'],
                            'contact.tel' => ['label' => 'Phone Label', 'type' => 'text'],
                        ],
                    ],
                    'copyright' => [
                        'label' => 'Copyright',
                        'fields' => [
                            'copyright' => ['label' => 'Copyright Text', 'type' => 'text', 'hint' => 'Use {{year}} and {{company}} as placeholders'],
                        ],
                    ],
                ],
            ],
        ];
    }

    public function index()
    {
        $structure = $this->getContentStructure();
        
        // Get all translations
        $enTranslations = Translation::where('locale', 'en')->get()->keyBy(fn($t) => "{$t->group}.{$t->key}");
        $swTranslations = Translation::where('locale', 'sw')->get()->keyBy(fn($t) => "{$t->group}.{$t->key}");

        // Build values array
        $values = ['en' => [], 'sw' => []];
        
        foreach ($structure as $group => $groupData) {
            foreach ($groupData['sections'] as $sectionKey => $section) {
                foreach ($section['fields'] as $fieldKey => $field) {
                    $fullKey = "{$group}.{$fieldKey}";
                    $values['en'][$fullKey] = $enTranslations->get($fullKey)?->value ?? '';
                    $values['sw'][$fullKey] = $swTranslations->get($fullKey)?->value ?? '';
                }
            }
        }

        return Inertia::render('Admin/Content', [
            'structure' => $structure,
            'values' => $values,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'locale' => 'required|in:en,sw',
            'group' => 'required|string',
            'key' => 'required|string',
            'value' => 'nullable|string',
        ]);

        Translation::setValue(
            $validated['locale'],
            $validated['group'],
            $validated['key'],
            $validated['value']
        );

        return back()->with('success', 'Content updated');
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'locale' => 'required|in:en,sw',
            'translations' => 'required|array',
            'translations.*.group' => 'required|string',
            'translations.*.key' => 'required|string',
            'translations.*.value' => 'nullable|string',
        ]);

        $sourceLocale = $validated['locale'];
        $targetLocale = $this->translationService->getOppositeLocale($sourceLocale);
        $translatedCount = 0;

        foreach ($validated['translations'] as $t) {
            // Save the original translation
            Translation::setValue(
                $sourceLocale,
                $t['group'],
                $t['key'],
                $t['value']
            );

            // Auto-translate to the other language if value is not empty
            if (!empty($t['value'])) {
                $translated = $this->translationService->translate(
                    $t['value'],
                    $sourceLocale,
                    $targetLocale
                );

                if ($translated) {
                    Translation::setValue(
                        $targetLocale,
                        $t['group'],
                        $t['key'],
                        $translated
                    );
                    $translatedCount++;
                }
            }
        }

        $message = 'Content saved successfully';
        if ($translatedCount > 0) {
            $targetName = $targetLocale === 'en' ? 'English' : 'Swahili';
            $message .= " and auto-translated to {$targetName}";
        }

        return back()->with('success', $message);
    }

    public function import()
    {
        $enPath = resource_path('js/translations/en.json');
        $swPath = resource_path('js/translations/sw.json');

        $enCount = Translation::importFromJson('en', $enPath);
        $swCount = Translation::importFromJson('sw', $swPath);

        return back()->with('success', "Imported {$enCount} English and {$swCount} Swahili translations");
    }

    /**
     * API endpoint to get translations for frontend
     */
    public function getForLocale(string $locale)
    {
        $translations = Translation::getForLocale($locale);
        
        // If no translations in database, fall back to JSON files
        if (empty($translations)) {
            $jsonPath = resource_path("js/translations/{$locale}.json");
            if (file_exists($jsonPath)) {
                $translations = json_decode(file_get_contents($jsonPath), true);
            }
        }
        
        return response()->json($translations)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}
