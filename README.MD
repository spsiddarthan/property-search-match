## Tech stack used to solved the problem

## Running the app

## Testing the end points using Postman

## The approach to the solution

The problem was solved in a fashion as shown below, each of the sections have been elaborated upon below.
1. Calculating the distance between two location - choose between Postgres postgis and Redis's geoadd.
2. Creating the initial test dataset and storing it in postgres. 
3. Creating the two REST POST end points to add a property and a search requirements, and also add these to the 
   redis zset and returning the list of matches, all instantaneously at a scale of 1 million rows of property and search requirements,
   each.
4. Computing the match percentage. 

#Computing the match percentage.

## Distance match contribution: 

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

# No. of bedroom and No. of bathroom match contribution

If the no. of bedrooms and bathrooms were inbetween the minimum and maximum number of bedrooms and bathrooms, respecitively,
then it amounts to a full 20% match. 
```
And if the delta b/w no. of bathrooms and the min/max no of bathrooms and the delta b/w no. of bedrooms and the min/max no of bedrooms
are greater than 2, then contribution amounts to 0%.

If the delta is 1, I've assumed the match % to be 10 and if the delta is 2, I've assumed the match % to be 5 since the
problem statement doesn't specifically speak about it. 
```

A summation of all the match percentages give us the total match percentage. 

