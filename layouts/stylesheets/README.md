.App is a wrapper container (default)

We will have a MainContainer used for Routing

Ex:
- localhost://login
App
	MainContainer
		form
		... more components
	/MainContainer
/App

- localhost://restaurant/:session_id
App
	MainContainer
		a different Component... more
	/MainContainer
App
