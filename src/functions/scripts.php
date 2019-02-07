<?php

    function my_theme_load_scripts(){
        wp_enqueue_style( 'style', get_stylesheet_uri() . '/style.css');
        wp_enqueue_script('jquery');
    }

    add_action('wp_enqueue_scripts', 'my_theme_load_scripts');
    
?>