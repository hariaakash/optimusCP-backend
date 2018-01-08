    $(function() {
        'use strict';

        // --------------------------
        // Global Variables
        // --------------------------
        var $this = $(this),
            nul = $('nav ul li'),
            ha = $("header .arrow"),
            sl = $('.skill-line');
        new WOW().init();
        // --------------------------
        // Check navigation for children
        // --------------------------
        nul.each(function() {
            var $this = $(this);
            if ($this.children('ul').length > 0) {
                $this.addClass('parent');
            }
            if ($this.children('ul.mega').length > 0) {
                $this.addClass('mega-parent');
            }
        });

        var navpos = $('nav').find('.parent > a');
        navpos.on('click', function(e) {
            e.preventDefault();
            var ww = $(window).width();
            if (ww < 991) {
                $(this).siblings('ul').slideToggle('500',
                    'swing');
            } else if ($('nav').hasClass('minimal')) {
                $(this).siblings('ul').slideToggle('500',
                    'swing');
            } else {
                return false;
            }
            return false;
        });

        // --------------------------
        // Trigger after scroll finish
        // --------------------------
        $(window).on('resize', function() {
            if (this.resizeTO) clearTimeout(this.resizeTO);
            this.resizeTO = setTimeout(function() {
                $(this).trigger('resizeEnd');
            }, 200);
        });

        $(window).on('resizeEnd', function() {
            var ww = $(window).width(),
                body = $('body');
            if (ww > 991) {
                body.removeClass('modal-open');
            }
            var masonry = $('.masonry');
            if (masonry.length > 0) {
                masonry.masonry('layout');
            }
            var blog = $('.blog');
            if (blog.length > 0) {
                blog.masonry('layout');
            }
        });

        // --------------------------
        // Minimal & Mobile Menu Functionality
        // --------------------------
        $('nav li.parent a').on('click', function() {
            var $this = $(this);
            $this.parent().toggleClass('open');
        });

        // --------------------------
        // Fade In on Load
        // --------------------------
        $(window).on('load', function() {
            $('.web-in').addClass('fade-in');
        });

        // --------------------------
        // Parallax
        // --------------------------
        // $('.parallax').parallax();


        // --------------------------
        // Smart Sticky Header
        // --------------------------
        var nav = new Headroom(document.querySelector("nav"), {
            tolerance: {
                up: 15,
                down: 50
            },
            offset: 450,
            classes: {
                initial: "initial",
                pinned: "fixed",
                unpinned: "unfixed"
            }
        });
        nav.init();

        // --------------------------
        // Arrow Down Click
        // --------------------------
        function arrowDown() {
            ha.on("click", function() {
                var banner = $(this).parent().height();
                $("html, body").animate({
                    scrollTop: banner
                }, 450);
                return false;
            });
        }
        arrowDown(); // Initialize arrowDown on document ready


        // --------------------------
        // Caption Scroll Modifier
        // --------------------------
        function captionScroll() {
            var caption = $('header').find('.caption'),
                arrow = $('.arrow'),
                wi = $(window),
                ww = wi.width(),
                wh = wi.height(),
                st = wi.scrollTop(),
                calc = $(window).scrollTop(),
                trans = calc / 2.33,
                arrowX = calc / 5.3,
                fade = (calc * 0.01),
                fade1 = fade / 6,
                fade2 = fade / 2;

            if (ww > 767 && wh > st) {
                caption.css({
                    'transform': 'translateY(' + trans +
                        'px)',
                    'opacity': 1 - fade1
                });
                arrow.css({
                    'transform': 'translateY(' + arrowX +
                        'px)',
                    'opacity': 1 - fade2
                });
                return false;
            } else {
                caption.css({
                    'transform': 'translateY(0)',
                    'opacity': 1
                });
                arrow.css({
                    'transform': 'translateY(0)',
                    'opacity': 1
                });

                return false;
            }
        }
        captionScroll();
        $(window).on('scroll', function() {
            captionScroll();
        });
        $(window).on('resize', function() {
            captionScroll();
        });

        // --------------------------
        // Start Project Modal
        // --------------------------
        var mbg = $('#modal-bg'),
            mbgee = $('#modal-bg #modal, .exit'),
            body = $('body');
        $('a.start-project').on('click', function() {
            mbg.addClass('appear');
            body.addClass('modal-open');
            setTimeout(function() {
                mbgee.addClass('pop');
            }, 300);
            return false;
        });
        $('#modal-bg .exit').on('click', function() {
            mbg.removeClass('appear');
            mbgee.removeClass('pop');
            body.removeClass('modal-open');
            return false;
        });

        // ----------------------------
        // Hamburger Menu
        // ----------------------------
        $('#menu-icon').on('click', function() {
            $('body').toggleClass('menu-open').toggleClass(
                'modal-open');
        });

        // ----------------------------
        // Back to Top
        // ----------------------------
        var su = $('.scrollup');

        function backtotop() {
            var wt = $(window).scrollTop();
            if (wt > 700) {
                su.addClass('vis');
            } else {
                su.removeClass('vis');
            }
        }
        backtotop();
        $(window).on('scroll', function() {
            backtotop();
        });
        su.on('click', function() {
            $("html, body").animate({
                scrollTop: 0
            }, 450);
            return false;
        });
    });
