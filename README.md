# DataMangler
A backend user data management system for Unity games. 

- User signup/validation/pw reset
- Web and Unity session authentication
- User scoring, activity, and purchase tracking
- Implements simple access control list for role-based security
- Basic multi-app and multi-tenancy support
- Leaderboards by app ID

requires node.js and mongodb

to install: 
1. run npm install in the app directory, to install node dependencies.
2. enter your database connection string in the server.js (~ line 80)
3. run node server.js in the app directory, to launch the server
4. In the unity client, enter localhost:8092 in the "host" variable field under the DataMangler object
5. play the demo project, and you should be able to create users, sign in, test scoring, activities, and purchases

Download the Unity demo client at https://servicemedia.s3.amazonaws.com/smDataMangler_5x.zip  - note, the Unity client requires the JSON.net package, available on the Unity Asset store. 

released under MIT license https://opensource.org/licenses/MIT
