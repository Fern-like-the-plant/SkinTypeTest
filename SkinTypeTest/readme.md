# Cocktails - Alphabetical Index
This Replit presents users with an Alphbetical Index of cocktails. A Navigation bar is constructed dynamically from an array of letters. Each letter is activated by JavaScript via an event listener, and connected to a corresponding endpoint on the [CocktailDB API](https://www.thecocktaildb.com/api.php). Conveniently, the CocktailDB API documentation describes an endpoint to fetch drinks based on their first letter. This is really useful in the current scenario since in the context of an Alphabetical Index, this endpoint returns precisely the subset of drinks that we are interested in.

# Styling the Navigation Dynamically
In this Script, JavaScript ensures that the current Letter remains selected in the navigation bar. This is done by adding and removing CSS classes, each time a letter is clicked. 

# Learning Prompts
- I used Monotype to add fonts to this page. Can you try creating your own font kit on Monotype, and updating the fonts to be more festive (as is suggested by the cocktails themsevles)?
- Can you add an event listener to each drink that will allow you to show a detailed view?
- How might you approach a solution that will automatically grey-out the letters for which no drinks exist?
- The CocktailDB includes a useful "first letter" endpoint, but the same feature is not always present in every API. For example, Pokemon API has no such feature. How might you approach the creation of an alphabetical index without the help of such an endpoint?