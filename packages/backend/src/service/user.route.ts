import route from "express"; 
route.get('/', (req, res) => {
  res.send('GET request to the homepage')
})