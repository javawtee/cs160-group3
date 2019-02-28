.App is a wrapper container (default)

We will have a MainContainer used for Routing

<b>Ex:</b>
- localhost://login<br>
App<br>
&nbsp;&nbsp;	MainContainer<br>
	&nbsp;&nbsp;&nbsp;&nbsp;	form<br>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;	... more components<br>
&nbsp;&nbsp;   /MainContainer<br>
/App<br>
<br>
- localhost://restaurant/:session_id<br>
App<br>
&nbsp;&nbsp;	MainContainer<br>
&nbsp;&nbsp;&nbsp;&nbsp;		a different Component... more<br>
&nbsp;&nbsp;	/MainContainer<br>
App<br>
