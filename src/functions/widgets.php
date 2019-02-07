<?php
    function my_theme_widgets_init(){
        register_sidebar(array(
            'name' => __('Sidebar Widget Area', 'my_theme'),
            'id' => 'primary-widget-area',
            'before_widget' => '<li id="%1$s">',
            'after_widget' => "</li>",
            'before_title' => '<h3>',
            'after_title' => '</h3>',
        ));
    }

    add_action('widgets_init', 'my_theme_widgets_init');

?>