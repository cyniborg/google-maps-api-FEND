# FEND Neighbourhood Map

**How to access the application:**
1. Open the index.html file in any modern browser.
2. On the left hand side of the screen, you will see a box with the list of places you can visit in Jaipur, Rajasthan, India
3. On the right hand side you can see the markers on Google Map
4. Clicking on the marker or the name of the place will open up a box and you can read further information from there.
5. If the information is not loading then check the console of your browser *(this is usually done by pressing f12 on windows computer)* to check for errors.
6. The most common error is the cross domain request with the wikipedia AJAX call. This is a security function and is difficult to bypass. It should work correctly when uploaded to a server or accessed from a server. You can also try to change the server name in app.js file at line 92.
10. The AJAX call for the information is made to wikipedia. 
