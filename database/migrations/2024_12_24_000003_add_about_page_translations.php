<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $translations = [
            // Team Section
            ['key' => 'about.team.title', 'en' => 'Our Leadership Team', 'sw' => 'Timu Yetu ya Uongozi'],
            ['key' => 'about.team.description', 'en' => 'Our team comprises experienced professionals with decades of combined experience in electrical engineering, project management, and business operations. Together, we drive SUMAJKT Electric towards excellence.', 'sw' => 'Timu yetu inajumuisha wataalamu wenye uzoefu wa miongo kadhaa katika uhandisi wa umeme, usimamizi wa miradi, na uendeshaji wa biashara. Kwa pamoja, tunaendesha SUMAJKT Electric kuelekea ubora.'],
            ['key' => 'about.team.joinTitle', 'en' => 'Join Our Team', 'sw' => 'Jiunge na Timu Yetu'],
            ['key' => 'about.team.joinText', 'en' => "We're always looking for talented individuals to join our growing team. Check our careers section for current opportunities.", 'sw' => 'Tunawatafuta daima watu wenye vipaji kujiunga na timu yetu inayokua. Angalia sehemu yetu ya kazi kwa fursa za sasa.'],
            
            // Philosophy Section
            ['key' => 'about.philosophy.title', 'en' => 'Our Philosophy', 'sw' => 'Falsafa Yetu'],
            ['key' => 'about.philosophy.description', 'en' => 'At SUMAJKT Electric, we believe that excellence in electrical engineering goes beyond technical expertise. It encompasses a commitment to safety, sustainability, and customer satisfaction.', 'sw' => 'Katika SUMAJKT Electric, tunaamini kuwa ubora katika uhandisi wa umeme unaenda zaidi ya utaalamu wa kiufundi. Unajumuisha kujitolea kwa usalama, uendelevu, na kuridhika kwa wateja.'],
            ['key' => 'about.philosophy.quality.title', 'en' => 'Quality First', 'sw' => 'Ubora Kwanza'],
            ['key' => 'about.philosophy.quality.text', 'en' => 'We never compromise on quality. Every project, regardless of size, receives our full attention and commitment to excellence. We use only certified materials and follow international standards.', 'sw' => 'Hatuwahi kupunguza ubora. Kila mradi, bila kujali ukubwa, unapata umakini wetu kamili na kujitolea kwa ubora. Tunatumia vifaa vilivyoidhinishwa tu na kufuata viwango vya kimataifa.'],
            ['key' => 'about.philosophy.partnership.title', 'en' => 'Customer Partnership', 'sw' => 'Ushirikiano na Wateja'],
            ['key' => 'about.philosophy.partnership.text', 'en' => 'We view our clients as partners. We listen, understand their needs, and work collaboratively to deliver solutions that exceed expectations while staying within budget and timeline.', 'sw' => 'Tunawaona wateja wetu kama washirika. Tunasikiliza, kuelewa mahitaji yao, na kufanya kazi kwa ushirikiano kutoa suluhisho zinazozidi matarajio huku tukibaki ndani ya bajeti na ratiba.'],
            ['key' => 'about.philosophy.innovation.title', 'en' => 'Innovation & Learning', 'sw' => 'Ubunifu na Kujifunza'],
            ['key' => 'about.philosophy.innovation.text', 'en' => "The electrical industry evolves rapidly. We stay ahead by continuously learning, adopting new technologies, and investing in our team's professional development.", 'sw' => 'Sekta ya umeme inabadilika haraka. Tunabaki mbele kwa kujifunza kila wakati, kukubali teknolojia mpya, na kuwekeza katika maendeleo ya kitaaluma ya timu yetu.'],
            ['key' => 'about.philosophy.sustainable.title', 'en' => 'Sustainable Practices', 'sw' => 'Mazoea Endelevu'],
            ['key' => 'about.philosophy.sustainable.text', 'en' => 'We are committed to environmental responsibility. We promote energy-efficient solutions, proper waste management, and sustainable practices in all our operations.', 'sw' => 'Tumejitolea kwa uwajibikaji wa mazingira. Tunakuza suluhisho za ufanisi wa nishati, usimamizi sahihi wa taka, na mazoea endelevu katika shughuli zetu zote.'],
            
            // Careers Section
            ['key' => 'about.careers.title', 'en' => 'Career Opportunities', 'sw' => 'Fursa za Kazi'],
            ['key' => 'about.careers.description', 'en' => "Join Tanzania's leading electrical contracting company. We offer competitive salaries, professional growth opportunities, and a supportive work environment.", 'sw' => 'Jiunge na kampuni inayoongoza ya ukandarasi wa umeme Tanzania. Tunatoa mishahara ya ushindani, fursa za ukuaji wa kitaaluma, na mazingira ya kazi yanayosaidia.'],
            ['key' => 'about.careers.openings', 'en' => 'Current Openings', 'sw' => 'Nafasi Zilizo Wazi'],
            ['key' => 'about.careers.fulltime', 'en' => 'Full-time', 'sw' => 'Wakati Wote'],
            ['key' => 'about.careers.multiple', 'en' => 'Multiple', 'sw' => 'Nyingi'],
            ['key' => 'about.careers.job1.title', 'en' => 'Senior Electrical Engineer', 'sw' => 'Mhandisi Mkuu wa Umeme'],
            ['key' => 'about.careers.job1.description', 'en' => 'Lead complex electrical projects, mentor junior engineers, and ensure quality standards.', 'sw' => 'Ongoza miradi ngumu ya umeme, fundisha wahandisi wachanga, na hakikisha viwango vya ubora.'],
            ['key' => 'about.careers.job1.location', 'en' => 'Dar es Salaam • 5+ years experience', 'sw' => 'Dar es Salaam • Uzoefu wa miaka 5+'],
            ['key' => 'about.careers.job2.title', 'en' => 'Project Coordinator', 'sw' => 'Mratibu wa Mradi'],
            ['key' => 'about.careers.job2.description', 'en' => 'Coordinate project activities, manage schedules, and liaise with clients and contractors.', 'sw' => 'Ratibu shughuli za mradi, simamia ratiba, na wasiliana na wateja na wakandarasi.'],
            ['key' => 'about.careers.job2.location', 'en' => 'Dar es Salaam • 3+ years experience', 'sw' => 'Dar es Salaam • Uzoefu wa miaka 3+'],
            ['key' => 'about.careers.job3.title', 'en' => 'Electrical Technician', 'sw' => 'Fundi wa Umeme'],
            ['key' => 'about.careers.job3.description', 'en' => 'Install, maintain, and repair electrical systems. VETA certification required.', 'sw' => 'Sakinisha, tunza, na rekebisha mifumo ya umeme. Cheti cha VETA kinahitajika.'],
            ['key' => 'about.careers.job3.location', 'en' => 'Various Locations • 2+ years experience', 'sw' => 'Maeneo Mbalimbali • Uzoefu wa miaka 2+'],
            ['key' => 'about.careers.howToApply', 'en' => 'How to Apply', 'sw' => 'Jinsi ya Kuomba'],
            ['key' => 'about.careers.applyText', 'en' => 'Send your CV and cover letter to', 'sw' => 'Tuma CV yako na barua ya maombi kwa'],
            ['key' => 'about.careers.applyNote', 'en' => 'Please include the position title in your email subject line.', 'sw' => 'Tafadhali jumuisha jina la nafasi katika mstari wa somo la barua pepe yako.'],
            
            // Policies Section
            ['key' => 'about.policies.title', 'en' => 'Company Policies', 'sw' => 'Sera za Kampuni'],
            ['key' => 'about.policies.description', 'en' => 'Our policies guide our operations and ensure we maintain the highest standards of professionalism, safety, and ethical conduct.', 'sw' => 'Sera zetu zinaongoza shughuli zetu na kuhakikisha tunashikilia viwango vya juu vya utaalamu, usalama, na mwenendo wa kimaadili.'],
            
            // Health & Safety Policy
            ['key' => 'about.policies.safety.title', 'en' => 'Health & Safety Policy', 'sw' => 'Sera ya Afya na Usalama'],
            ['key' => 'about.policies.safety.text', 'en' => 'Safety is our top priority. We maintain strict safety protocols on all job sites, provide regular safety training, and ensure all work complies with OSHA standards.', 'sw' => 'Usalama ni kipaumbele chetu cha juu. Tunashikilia itifaki kali za usalama katika maeneo yote ya kazi, kutoa mafunzo ya usalama mara kwa mara, na kuhakikisha kazi zote zinazingatia viwango vya OSHA.'],
            ['key' => 'about.policies.safety.item1', 'en' => 'Mandatory PPE for all site personnel', 'sw' => 'PPE ya lazima kwa wafanyakazi wote wa eneo'],
            ['key' => 'about.policies.safety.item2', 'en' => 'Regular safety audits and inspections', 'sw' => 'Ukaguzi wa usalama na ukaguzi wa mara kwa mara'],
            ['key' => 'about.policies.safety.item3', 'en' => 'Zero tolerance for safety violations', 'sw' => 'Kutovumilia ukiukaji wa usalama'],
            ['key' => 'about.policies.safety.item4', 'en' => 'Incident reporting and investigation procedures', 'sw' => 'Taratibu za kuripoti na kuchunguza matukio'],
            
            // Environmental Policy
            ['key' => 'about.policies.environment.title', 'en' => 'Environmental Policy', 'sw' => 'Sera ya Mazingira'],
            ['key' => 'about.policies.environment.text', 'en' => 'We are committed to minimizing our environmental impact and promoting sustainable practices.', 'sw' => 'Tumejitolea kupunguza athari zetu za mazingira na kukuza mazoea endelevu.'],
            ['key' => 'about.policies.environment.item1', 'en' => 'Proper disposal of electrical waste', 'sw' => 'Utupaji sahihi wa taka za umeme'],
            ['key' => 'about.policies.environment.item2', 'en' => 'Energy-efficient solutions for clients', 'sw' => 'Suluhisho za ufanisi wa nishati kwa wateja'],
            ['key' => 'about.policies.environment.item3', 'en' => 'Reduced paper usage through digital documentation', 'sw' => 'Kupunguza matumizi ya karatasi kupitia nyaraka za kidijitali'],
            ['key' => 'about.policies.environment.item4', 'en' => 'Recycling programs at all offices', 'sw' => 'Programu za kuchakata tena katika ofisi zote'],
            
            // Ethics & Compliance
            ['key' => 'about.policies.ethics.title', 'en' => 'Ethics & Compliance', 'sw' => 'Maadili na Uzingatiaji'],
            ['key' => 'about.policies.ethics.text', 'en' => 'We conduct business with integrity and transparency, adhering to all applicable laws and regulations.', 'sw' => 'Tunafanya biashara kwa uadilifu na uwazi, tukizingatia sheria na kanuni zote zinazotumika.'],
            ['key' => 'about.policies.ethics.item1', 'en' => 'Anti-corruption and anti-bribery commitment', 'sw' => 'Kujitolea kupinga rushwa na hongo'],
            ['key' => 'about.policies.ethics.item2', 'en' => 'Fair competition practices', 'sw' => 'Mazoea ya ushindani wa haki'],
            ['key' => 'about.policies.ethics.item3', 'en' => 'Confidentiality of client information', 'sw' => 'Usiri wa taarifa za wateja'],
            ['key' => 'about.policies.ethics.item4', 'en' => 'Whistleblower protection', 'sw' => 'Ulinzi wa wafichuaji'],
            
            // Quality Assurance
            ['key' => 'about.policies.quality.title', 'en' => 'Quality Assurance', 'sw' => 'Uhakikisho wa Ubora'],
            ['key' => 'about.policies.quality.text', 'en' => 'We maintain rigorous quality standards throughout all phases of our projects.', 'sw' => 'Tunashikilia viwango vikali vya ubora katika hatua zote za miradi yetu.'],
            ['key' => 'about.policies.quality.item1', 'en' => 'ISO 9001 quality management principles', 'sw' => 'Kanuni za usimamizi wa ubora wa ISO 9001'],
            ['key' => 'about.policies.quality.item2', 'en' => 'Regular quality audits', 'sw' => 'Ukaguzi wa ubora wa mara kwa mara'],
            ['key' => 'about.policies.quality.item3', 'en' => 'Continuous improvement programs', 'sw' => 'Programu za uboreshaji endelevu'],
            ['key' => 'about.policies.quality.item4', 'en' => 'Customer feedback integration', 'sw' => 'Ujumuishaji wa maoni ya wateja'],
        ];

        foreach ($translations as $t) {
            // Remove the 'about.' prefix from the key since group is already 'about'
            $keyWithoutGroup = str_replace('about.', '', $t['key']);
            
            // Insert English version
            $existsEn = DB::table('translations')
                ->where('locale', 'en')
                ->where('group', 'about')
                ->where('key', $keyWithoutGroup)
                ->exists();
            if (!$existsEn) {
                DB::table('translations')->insert([
                    'locale' => 'en',
                    'group' => 'about',
                    'key' => $keyWithoutGroup,
                    'value' => $t['en'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            // Insert Swahili version
            $existsSw = DB::table('translations')
                ->where('locale', 'sw')
                ->where('group', 'about')
                ->where('key', $keyWithoutGroup)
                ->exists();
            if (!$existsSw) {
                DB::table('translations')->insert([
                    'locale' => 'sw',
                    'group' => 'about',
                    'key' => $keyWithoutGroup,
                    'value' => $t['sw'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        $keys = [
            'about.team.title', 'about.team.description', 'about.team.joinTitle', 'about.team.joinText',
            'about.philosophy.title', 'about.philosophy.description',
            'about.philosophy.quality.title', 'about.philosophy.quality.text',
            'about.philosophy.partnership.title', 'about.philosophy.partnership.text',
            'about.philosophy.innovation.title', 'about.philosophy.innovation.text',
            'about.philosophy.sustainable.title', 'about.philosophy.sustainable.text',
            'about.careers.title', 'about.careers.description', 'about.careers.openings',
            'about.careers.fulltime', 'about.careers.multiple',
            'about.careers.job1.title', 'about.careers.job1.description', 'about.careers.job1.location',
            'about.careers.job2.title', 'about.careers.job2.description', 'about.careers.job2.location',
            'about.careers.job3.title', 'about.careers.job3.description', 'about.careers.job3.location',
            'about.careers.howToApply', 'about.careers.applyText', 'about.careers.applyNote',
            'about.policies.title', 'about.policies.description',
            'about.policies.safety.title', 'about.policies.safety.text',
            'about.policies.safety.item1', 'about.policies.safety.item2', 'about.policies.safety.item3', 'about.policies.safety.item4',
            'about.policies.environment.title', 'about.policies.environment.text',
            'about.policies.environment.item1', 'about.policies.environment.item2', 'about.policies.environment.item3', 'about.policies.environment.item4',
            'about.policies.ethics.title', 'about.policies.ethics.text',
            'about.policies.ethics.item1', 'about.policies.ethics.item2', 'about.policies.ethics.item3', 'about.policies.ethics.item4',
            'about.policies.quality.title', 'about.policies.quality.text',
            'about.policies.quality.item1', 'about.policies.quality.item2', 'about.policies.quality.item3', 'about.policies.quality.item4',
        ];

        DB::table('translations')->whereIn('key', $keys)->delete();
    }
};
