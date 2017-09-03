var modalSelector = document.querySelectorAll(".video button");
var modalOpen = false;
var modal = document.getElementsByClassName("modal");
var overlay = document.getElementsByClassName("overlay");
var closeButtons = document.querySelectorAll(".modal button, .overlay");
var iframe = document.querySelectorAll(".modal iframe");
var iframeSrc = iframe[0].getAttribute('src');

function closeModal() {
    // Hide modal divs, hide modal from screen-readers and resset main content to scroll
    modal[0].setAttribute('hidden', 'hidden');
    modal[0].setAttribute('aria-hidden', 'true');
    overlay[0].setAttribute('hidden', 'hidden');
    document.body.style.overflow = '';

    // Reset video
    iframe[0].setAttribute('src', iframeSrc);

    // Remove event listeners for when modal is open
    closeButtons[0].removeEventListener('click', closeModal);
    closeButtons[1].removeEventListener('click', closeModal);
    document.body.removeEventListener('keydown', checkKeyPress);

    modalSelector[0].focus(); // Return users focus - accessibility
}

function checkKeyPress(e) {
    if (document.activeElement.className === 'button' && e.key === 'Tab') {
        // If tab pressed and element is last button
        e.preventDefault();
        iframe[0].focus();
    } else if (e.key === 'Escape') {
        // If escape is pressed close the modal
        closeModal();
    }
}

function openModal() {
    // Show modal divs, unhide modal from screen-readers and set main content to not scroll
    modal[0].removeAttribute('hidden');
    modal[0].setAttribute('aria-hidden', 'false');
    overlay[0].removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // Autoplay video
    iframe[0].setAttribute('src', iframeSrc + "?autoplay=1");

    // Event listers for clicking on close, the overlay and keypress on last item (so we trap keyboard users within the modal)
    closeButtons[0].addEventListener('click', closeModal);
    closeButtons[1].addEventListener('click', closeModal);
    document.body.addEventListener('keydown', checkKeyPress);

    // Focus on title rather than iFrame so Esc button works straight away - slight hack
    iframe[0].focus();
    window.scrollTo(0, 0);
}

function scrollOffset(event, element) {
    event.preventDefault();
    var offset = document.getElementById(element);
    smooth_scroll_to(document.body, offset.offsetTop, 1000);
    // After offset focus the element
    setTimeout(function() {
        offset.focus();
    }, 1000);
    
}


/**
    From https://coderwall.com/p/hujlhg/smooth-scrolling-without-jquery

    Please do not review
**/
var smooth_scroll_to = function(element, target, duration) {
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
        return Promise.reject("bad duration");
    }
    if (duration === 0) {
        element.scrollTop = target;
        return Promise.resolve();
    }

    var start_time = Date.now();
    var end_time = start_time + duration;

    var start_top = element.scrollTop;
    var distance = target - start_top;

    // based on http://en.wikipedia.org/wiki/Smoothstep
    var smooth_step = function(start, end, point) {
        if(point <= start) { return 0; }
        if(point >= end) { return 1; }
        var x = (point - start) / (end - start); // interpolation
        return x*x*(3 - 2*x);
    }

    return new Promise(function(resolve, reject) {
        // This is to keep track of where the element's scrollTop is
        // supposed to be, based on what we're doing
        var previous_top = element.scrollTop;

        // This is like a think function from a game loop
        var scroll_frame = function() {
            if(element.scrollTop != previous_top) {
                reject("interrupted");
                return;
            }

            // set the scrollTop for this frame
            var now = Date.now();
            var point = smooth_step(start_time, end_time, now);
            var frameTop = Math.round(start_top + (distance * point));
            element.scrollTop = frameTop;

            // check if we're done!
            if(now >= end_time) {
                resolve();
                return;
            }

            // If we were supposed to scroll but didn't, then we
            // probably hit the limit, so consider it done; not
            // interrupted.
            if(element.scrollTop === previous_top
                && element.scrollTop !== frameTop) {
                resolve();
                return;
            }
            previous_top = element.scrollTop;

            // schedule next frame for execution
            setTimeout(scroll_frame, 0);
        }

        // boostrap the animation process
        setTimeout(scroll_frame, 0);
    });
}