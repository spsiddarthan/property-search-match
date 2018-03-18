## Tech stack used to solved the problem and environment.
Express and Node were used to build the two backend end points. 

PostgresSQL was used as the choice of DB. 

The ORM used is sequelize.

Redis is the in-memory db used. It is used to compute distances between two locations in realtime. 

```
The app is hosted on digital ocean and the end points are available 
at http://139.59.6.142:5000/property and http://139.59.6.142:5000/search-requirement
The db is hosted at http://159.89.175.10:5432
Redis is hosted at http://139.59.6.142:6379 (Same machine as the api end points for simplicity)

Node version: v9.7.1
PostgreSQL  version: 9.3.22
Redis Version:4.0.8

```


## Running the app

Pre-requisites: You must have the following installed:  
```
git, node, redis and postgres
```

First, clone the repository 

```
git clone https://github.com/spsiddarthan/property-search-match
cd property-search-match
npm install 

#Run the seed scripts to seed data

//Do not forget to replace the env vars with the actual values

//Seed the DB with data - (run the script 5 times to create 1 million rows, 
//running it once creates 125,000 rows each for property and search requirements)

DB_USER_NAME='username' DB_PASSWORD='password' DB_HOST='db-host-name' 
node seed-scripts/populateSearchRequirement.js
DB_USER_NAME='username' DB_PASSWORD='password' DB_HOST='db-host-name' 
node seed-scripts/populateProperties.js.

//Populate the redis store with two keys 'locations' - we will be adding the 
//propertyIds as a member to this key and 'requirements' - we will be adding the search 
//requirementIds to this key. Refer to the distance calucalation section below for 
//more details on this

 DB_USER_NAME='username' DB_PASSWORD='password' DB_HOST='db-host-name' 
 node seedscripts/populateRedisWithSearchRequirements.js
 DB_USER_NAME='username' DB_PASSWORD='password' DB_HOST='db-host-name' 
 node seed-scripts/populateRedisWithProperties.js
 
 //Please have PM2 installed globally, now start the app like this:
 DB_USER_NAME='username' DB_PASSWORD='password' DB_HOST='db-host-name' 
 
  pm2 start  index.js


```

# The approach and thought process to the solution

The problem was solved in these sequentials steps, each of the sections have been elaborated upon below.
1. Calculating the distance between two locations.
2. Creating the initial test dataset and storing it in postgres. 
3. Creating the two REST POST end points to add a property and a search requirements, and also add these to the 
   redis zset and returning the list of matches, all instantaneously at a scale of 1 million rows of property and search requirements,
   each.
4. Computing the match percentage. 

# Calculating the distance 

PostGis and Redis were the two options explored. 
```

PostGIS is a spatial database extender for PostgreSQL object-relational database. It adds 
support for geographic objects allowing location queries to be run in SQL. It assumes 
the earth to be a spheroid. 

Redis also has support for adding geo-locations using the GEOADD key, it essentially adds
the specified geospatial items (latitude, longitude, name) to the specified key. Data is 
stored into the key as a sorted set, in a way that makes it possible to later retrieve 
items using a query by radius with the GEORADIUS or GEORADIUSBYMEMBER commands. 
Redis assumes the earth to be a sphere.

I spent quite a lot of time dabblign with PostGis, but it seemed to complex to use for the 
use case in hand, compute distance between two points or get all the geo location 
within the radius of a given location.

Hence, I picked Redis as my solution of choice to compute distances between two geo-locations. 

When a post request is made to the http://139.59.6.142:5000/property end point, three things happen -
1. The property object gets added to the "Properties" postgres table.
2. The property id gets to the a sorted set in redis with key 'locations' and id 'propertyId'.
3. All the search requirements within a radius of 10 miles are obtained from redis 
using the georadius command.
````

## Creating the initial test dataset and storing it in postgres. 
```
The initial data set created using the module `cities.json` (see package.json)
It has about 125,000 cities with their corresponding latitude and longitude.

I ran the migration script about 10 times to create a million records for both 
cities and search requirements to confirm that the solution scaled, and it did. 
```

# Creating the REST API end points
 The clients can hit the http://139.59.6.142:5000/property and http://139.59.6.142:5000/search-requirement
 end points to add properties and search requirements, respectively. 
 
 When a post request is made to the http://139.59.6.142:5000/property end point, three things happen -
   1. The property object gets added to the "Properties" postgres table.
   2. The propertyId (primary key of the property) gets to the a sorted set in redis with key 'locations' and id 'propertyId'.
   3. All the search requirements within a radius of 10 miles are obtained from redis 
   using the georadius command.
 
 When a post request is made to the http://139.59.6.142:5000/search-requirement end point, three things happen -
   1. The search requirement object gets added to the "SearchRequirements" postgres table.
   2. The searchRequirementId gets to the a sorted set in redis with key 'requirements' and id 'searchRequirementId'.
   3. All the search requirements within a radius of 10 miles are obtained from redis 
   using the georadius command.
   
   Make a requesy to these end points like this and see the matches (see below section for matches computation) being 
   returned immediately.
   Sample JSON body for `http://139.59.6.142:5000/search-requirement`
   

    ```
     
        {
         "minNoOfBathrooms" : 1,
         "maxNoOfBathrooms" : 4,
         "minNoOfBedrooms" : 1,
         "maxNoOfBedrooms": 4,
         "minBudget" : "3526",
         "maxBudget" : "4000",
         "latitude" : 74.001010,
         "longitude" : 40.1028029
         }
      ```
   
   
       Sample JSON body for `http://139.59.6.142:5000/property`
      ```

        {
         "noofbathrooms" : 3,
         "noofbedrooms": 3,
         "price" : "3526",
         "latitude" : 74.001010,
         "longitude" : 40.1028029
         }
   
      ```

# Computing the match percentage.

# Distance match contribution: 

2 miles of distance has a contribution of 30%. As the distance increases, the contribution comes down. 
We do not check for distances that are apart by more than 10 miles. 
```
=>  percentage-contribution is inversely proportional to distance. 
=>  distance = K/percentage-contribution, where K is the constant 
=> K = percentage-contribution * distance = 2 * 30 = 60; 

Hence, for 3 miles, percentage contribution= 60/3 = 20. 
       for 4 miles, percentage contribution= 60/4 = 15.
       for 5 miles, percentage contribution= 60/5 = 12.
       for 6 miles, percentage contribution = 60/6 = 10.
       for 7 miles, percentage contribution= 60/7 = 8.5714.
       for 8 miles, percentage contribution = 60/8 = 7.5
       for 9 miles, percentage contribution = 60/9 = 6.66
       for 10 miles,percentagee contribution= 60/10 = 6.  
```       

## Budget match contribution

If the price is inbetween minBudget and maxBudget, the budget match contribution is a full 30%. 
If only one out of minBudget and minBudget is given, the budget match contribution is a full 30%
when the  delta between the budget (min or max value) and the price is less than 10%. If the delta
is more than 25%, the budget match contribution is a 0%.

If both minBudget and minBudget are given, but the price is less than minBudget, then check for the delta and 
see if it's within the 25% range. 


10 percent delta has a contribution of 30%. 25% is the maximum delta possible.
```
=>  percentage-contribution is inversely proportional to percentage delta. 
=>  distance = K/percentage-contribution, where K is the constant 
=> K = percentage-contribution * distance = 10 * 30 = 300; 

Hence, for 11 percent delta, percentage contribution = 300/11 = 27.27. 
       for 12 percent delta, percentage contribution= 300/12 = 25.
       .
       .
       .
       .
       for 25 percent delta,percentagee contribution= 300/25 = 12.  

```

# Bedroom and Bathroom count match contribution (algorithm used for both the bedrooms and bathrooms are similar)

If the no. of bedrooms and bathrooms were in between the minimum and maximum number of bedrooms and bathrooms, respecitively,
then it amounts to a full 20% match. 
```
And if the delta b/w no. of bathrooms and the min/max no of bathrooms and the delta b/w no. of bedrooms and the min/max no of bedrooms
are greater than 2, then contribution amounts to 0%.

If the delta is 1, I've assumed the match % to be 10 and if the delta is 2, I've assumed the match % to be 5 since the
problem statement doesn't specifically speak about it. 
```

A summation of all the match percentages give us the total match percentage. 

