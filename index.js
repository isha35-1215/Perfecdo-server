const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.flmhf7e.mongodb.net/?retryWrites=true&w=majority`;

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client.connect().then(() => {
  console.log('Connected to MongoDB');

  const taskCollection = client.db('Perfecdo').collection('task');

  // API endpoint to add a task
  app.post('/addtask', async (req, res) => {
    try {
      const item = req.body;
      const result = await taskCollection.insertOne(item);
      res.json(result);
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // API endpoint to get all tasks (example)
  app.get('/tasks', async (req, res) => {
    try {
      const tasks = await taskCollection.find({}).toArray();
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// ...

app.put('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true };
    const taskData = req.body;
    const item = {
        $set: {
            priority: taskData.priority,
            deadline: taskData.deadline,
            description: taskData.description,
        }
    }
    const result = await taskCollection.updateOne(filter, item, options);
    res.send(result);
})

// API endpoint to update task status
app.put('/updateStatus/:taskId', async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.taskId;

  try {
    const updatedTask = await taskCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (!updatedTask.value) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Status updated successfully', updatedTask: updatedTask.value });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ...


app.get('/', (req, res) => {
    res.send('Perfecdo is Serving')
})
app.listen(port, () => {
    console.log(`Perfecdo is Serving on port : ${port}`)
})
}).catch(error => {
  console.error('Error connecting to MongoDB:', error);
});