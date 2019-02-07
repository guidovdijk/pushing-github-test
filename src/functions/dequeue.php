<?php
    // Uitleg: https://www.cozmoslabs.com/58990-remove-unused-css-js-files-in-wordpress/ 

    // remove script handles we don't need, each with their own conditions 
    add_action('wp_print_scripts', 'filter_scripts', 100000);
    add_action('wp_print_footer_scripts',  'filter_scripts', 100000);
    
    function filter_scripts(){
        #wp_deregister_script($handle);
        #wp_dequeue_script($handle);

        wp_deregister_script('');
        wp_dequeue_script('');
    }
    
    
    // remove styles we don't need
    add_action('wp_print_styles', 'filter_styles', 100000);
    add_action('wp_print_footer_scripts', 'filter_styles', 100000);

    function filter_styles(){
        #wp_deregister_style($handle);
        #wp_dequeue_style($handle);

        wp_deregister_style('');
        wp_dequeue_style('');
    }
    
    
    // list loaded assets by our theme and plugins so we know what we're dealing with. This is viewed by admin users only.
    add_action('wp_print_footer_scripts', 'list_assets', 900000);
    function list_assets(){
        if ( !current_user_can('delete_users') ){
            return;
        }
    
        echo '<h2>List of all scripts loaded on this particular page.</h2>';
        echo '<p>This can differ from page to page depending of what is loaded in that particular page.</p>';
    
        // Print all loaded Scripts (JS)
        global $wp_scripts;
        print_assets($wp_scripts);
    
        echo '<h2>List of all css styles loaded on this particular page.</h2>';
        echo '<p>This can differ from page to page depending of what is loaded in that particular page.</p>';
        // Print all loaded Styles (CSS)
        global $wp_styles;
        print_assets($wp_styles);
    }
    
    function print_assets($wp_asset){
        $nb_of_asset = 0;
        foreach( $wp_asset->queue as $asset ) :
            $nb_of_asset ++;
            $asset_obj = $wp_asset->registered[$asset];
            asset_template($asset_obj, $nb_of_asset);
        endforeach;
    }
    
    function asset_template($asset_obj, $nb_of_asset){
        if( is_object( $asset_obj ) ){
            echo '<div class="asset" style="padding: 2rem; font-size: 0.8rem; border-bottom: 1px solid #ccc;">';
    
            echo '<div class="asset_nb"><span style="width: 150px; display: inline-block">Number:</span>';
            echo $nb_of_asset . '</div>';
    
    
            echo '<div class="asset_handle"><span style="width: 150px; display: inline-block">Handle:</span>';
            echo $asset_obj->handle . '</div>';
    
            echo '<div class="asset_src"><span style="width: 150px; display: inline-block">Source:</span>';
            echo $asset_obj->src . '</div>';
    
            echo '<div class="asset_deps"><span style="width: 150px; display: inline-block">Dependencies:</span>';
            foreach( $asset_obj->deps as $deps){
                echo $deps . ' / ';
            }
            echo '</div>';
    
            echo '<div class="asset_ver"><span style="width: 150px; display: inline-block">Version:</span>';
            echo $asset_obj->ver . '</div>';
    
            echo '</div>';
    
        }
    }

?>