<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $projects = \App\Models\Project::where('is_active', true)->get();
        $lands = \App\Models\LandInvestment::where('is_active', true)->get();
        
        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        
        // Static pages
        $pages = [
            ['url' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => '/about', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['url' => '/services', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['url' => '/investments', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['url' => '/projects', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['url' => '/training', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => '/managing-director', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => '/contact', 'priority' => '0.8', 'changefreq' => 'monthly'],
        ];
        
        foreach ($pages as $page) {
            $sitemap .= '<url>';
            $sitemap .= '<loc>' . url($page['url']) . '</loc>';
            $sitemap .= '<changefreq>' . $page['changefreq'] . '</changefreq>';
            $sitemap .= '<priority>' . $page['priority'] . '</priority>';
            $sitemap .= '</url>';
        }
        
        // Dynamic project pages
        foreach ($projects as $project) {
            $sitemap .= '<url>';
            $sitemap .= '<loc>' . url('/projects/' . $project->id) . '</loc>';
            $sitemap .= '<lastmod>' . $project->updated_at->toAtomString() . '</lastmod>';
            $sitemap .= '<changefreq>monthly</changefreq>';
            $sitemap .= '<priority>0.7</priority>';
            $sitemap .= '</url>';
        }
        
        $sitemap .= '</urlset>';
        
        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }
}
