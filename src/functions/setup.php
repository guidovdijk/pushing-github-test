<?php

    function my_theme_setup(){
        load_theme_textdomain('my_theme', get_template_directory() . '/languages');
        add_theme_support('title-tag');
        add_theme_support('automatic-feed-links');
        add_theme_support('post-thumbnails');
        global $content_width;
        if (!isset($content_width)) $content_width = 640;
        register_nav_menus(
            array('main-menu' => __('Main Menu', 'my_theme'))
        );
    }

    add_action('after_setup_theme', 'my_theme_setup');

?>