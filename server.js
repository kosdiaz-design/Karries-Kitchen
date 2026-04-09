const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'KarriesKitchen.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Karrie's Kitchen running on port ${PORT}`);
});
