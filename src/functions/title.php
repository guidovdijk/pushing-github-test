<?php 

    function my_theme_title($title){
        if ($title == ''){
            return '&rarr;';
        } else{
            return $title;
        }
    }

    add_filter('the_title', 'my_theme_title');


    function my_theme_filter_wp_title($title){
        return $title . esc_attr(get_bloginfo('name'));
    }

    add_filter('wp_title', 'my_theme_filter_wp_title');


?>