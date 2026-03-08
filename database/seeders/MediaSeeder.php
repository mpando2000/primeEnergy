<?php

namespace Database\Seeders;

use App\Models\Media;
use Illuminate\Database\Seeder;

class MediaSeeder extends Seeder
{
    public function run(): void
    {
        // Home Slides
        $slides = [
            [
                'title' => 'Powering Tanzania\'s Future',
                'type' => 'slide',
                'image_path' => 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1600&h=600&fit=crop',
                'description' => 'Leading electrical contractor delivering excellence across East Africa',
                'link_text' => 'Our Services',
                'link_url' => '/services',
                'sort_order' => 1,
            ],
            [
                'title' => 'Expert Electrical Solutions',
                'type' => 'slide',
                'image_path' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&h=600&fit=crop',
                'description' => 'From power distribution to renewable energy installations',
                'link_text' => 'View Projects',
                'link_url' => '/projects',
                'sort_order' => 2,
            ],
            [
                'title' => 'Building Tomorrow Today',
                'type' => 'slide',
                'image_path' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=600&fit=crop',
                'description' => 'Quality workmanship and professional service since establishment',
                'link_text' => 'About Us',
                'link_url' => '/about',
                'sort_order' => 3,
            ],
        ];

        // Chairperson
        $chairperson = [
            [
                'title' => 'Eng. John Mwakasege',
                'type' => 'chairperson',
                'image_path' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop',
                'description' => 'Chairperson & Founder',
                'sort_order' => 1,
            ],
        ];

        // Services Gallery
        $services = [
            [
                'title' => 'Electrical Installation',
                'type' => 'service',
                'image_path' => 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
                'description' => 'Professional electrical wiring and installation',
                'sort_order' => 1,
            ],
            [
                'title' => 'HVAC Systems',
                'type' => 'service',
                'image_path' => 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
                'description' => 'Heating, ventilation and air conditioning',
                'sort_order' => 2,
            ],
            [
                'title' => 'Solar Power',
                'type' => 'service',
                'image_path' => 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
                'description' => 'Renewable energy solutions',
                'sort_order' => 3,
            ],
            [
                'title' => 'Security Systems',
                'type' => 'service',
                'image_path' => 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop',
                'description' => 'CCTV and access control',
                'sort_order' => 4,
            ],
            [
                'title' => 'Network Infrastructure',
                'type' => 'service',
                'image_path' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
                'description' => 'ICT and data center solutions',
                'sort_order' => 5,
            ],
            [
                'title' => 'Power Distribution',
                'type' => 'service',
                'image_path' => 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
                'description' => 'HT/LT line construction',
                'sort_order' => 6,
            ],
        ];

        // Team Members
        $team = [
            [
                'title' => 'Eng. James Kimaro',
                'type' => 'team',
                'image_path' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
                'position' => 'Managing Director',
                'sort_order' => 1,
            ],
            [
                'title' => 'Sarah Mushi',
                'type' => 'team',
                'image_path' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
                'position' => 'Finance Manager',
                'sort_order' => 2,
            ],
            [
                'title' => 'Eng. Peter Massawe',
                'type' => 'team',
                'image_path' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
                'position' => 'Technical Director',
                'sort_order' => 3,
            ],
            [
                'title' => 'Grace Mwanga',
                'type' => 'team',
                'image_path' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop',
                'position' => 'HR Manager',
                'sort_order' => 4,
            ],
            [
                'title' => 'Eng. David Shirima',
                'type' => 'team',
                'image_path' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop',
                'position' => 'Project Manager',
                'sort_order' => 5,
            ],
        ];

        // General Images
        $general = [
            [
                'title' => 'Company Office',
                'type' => 'general',
                'image_path' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
                'description' => 'Our headquarters in Dar es Salaam',
                'sort_order' => 1,
            ],
            [
                'title' => 'Team at Work',
                'type' => 'general',
                'image_path' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
                'description' => 'Our engineers on site',
                'sort_order' => 2,
            ],
            [
                'title' => 'Equipment',
                'type' => 'general',
                'image_path' => 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
                'description' => 'Modern tools and equipment',
                'sort_order' => 3,
            ],
        ];

        // Insert all media
        foreach (array_merge($slides, $chairperson, $services, $team, $general) as $item) {
            Media::create(array_merge($item, ['is_active' => true]));
        }
    }
}
