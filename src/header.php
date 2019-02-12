<!DOCTYPE html>

<html <?php language_attributes(); ?>>

<head>

    <meta charset="<?php bloginfo('charset'); ?>"/>

    <meta name="viewport" content="width=device-width"/>

    <link rel="stylesheet" type="text/css" href="<?php echo get_stylesheet_uri(); ?>"/>

    <?php wp_head(); ?>

</head>

<body <?php body_class(); ?>>

    <header class='header'>

        <?php if (is_front_page() || is_home() || is_front_page() && is_home()) : ?>
            <a class="header__home-link" href="<?php echo esc_url(home_url('/')); ?>" title="<?php echo esc_html(get_bloginfo('name')); ?>" rel="home">
                <?php echo esc_html(get_bloginfo('name')); ?>
            </a>
        <?php endif; ?>

        <div class="header__description"><?php bloginfo('description'); ?></div>


        <nav class="header__navigation" role="navigation">

            <div class="header__navigation__searchform">

                <?php get_search_form(); ?>

            </div>

            <ul class="header__navigation__list">

                <?php wp_nav_menu(array('theme_location' => 'main-menu')); ?>

            </ul>

        </nav>

    </header>

    <div class='container'>
