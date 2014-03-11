AsciiVideo
======================

http://morning-waters-2699.herokuapp.com

For demo just press "play" or "webcam".

###Playing external sources
You can play every source that is suitable for html5 video tag.

###How to play YouTube video in the AsciiVideo player?

1. You can't play YT links. What you can play is the url from the src attribute of the html5 video tag.
2. If you haven't already turned on the html5 player do it from here (http://www.youtube.com/html5).
3. Navigate to the video you want to play, open console and type:

    document.getElementsByTagName('video')[0].src
    
copy that and paste it in the textbox next to "Play this" button.

Note: You can't play sources starting with "blob:" and if you're using Chrome you'll get "blob:" in this case get the source with firefox (if you manage to hack the "blob:" source, please let me know how you did it).

Note2: These video sources will eventually expire, so you can't just save them and play them again tomorrow!

Note3: I suggest playing videos in Chrome for better experience.
