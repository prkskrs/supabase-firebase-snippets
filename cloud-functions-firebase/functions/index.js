const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const serviceAccountKey = require("./serviceAccountKey.json");
const { user } = require("firebase-functions/v1/auth");
const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

app.use(cors({ origin: true }));

// database
const db = admin.firestore()

// Routes

app.get("/", (req, res) => {
    return res.status(200).send("HEyyyy");
});

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // console.log(authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        // console.log(token);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify the JWT token
        const decodedToken = jwt.verify(token, 'your_secret_key');
        // console.log(decodedToken);
        req.userId = decodedToken.userId;

        next();
    } catch (error) {
        console.error('Error authenticating user:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};



app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(req.body);

        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(401).json({ message: 'User with this email already exists!Ï' });
        }

        const userDetailsRef = await db.collection('users');

        const newUser = {
            id: Date.now(),
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };

        await userDetailsRef.add(newUser);

        return res.status(200).json({
            success: true,
            message: "User created successfully"
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Failed to register user' });
    }
});


app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log(userSnapshot);

        const userDoc = userSnapshot.docs[0];
        console.log(userDoc);

        const userData = userDoc.data();
        console.log(userData);

        if (password !== userData.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: userDoc.id }, 'your_secret_key', { expiresIn: '1h' });
        console.log(token);
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ message: 'Failed to login' });
    }
});


// create a task
app.post('/api/tasks', authenticate, async (req, res) => {
    try {
        const { userId } = req;
        const { title, description } = req.body;

        console.log(userId);
        console.log(req.body);

        const taskDoc = await admin.firestore().collection('tasks').add({
            userId,
            title,
            description,
        });

        return res.status(201).json({ taskId: taskDoc.id });
    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ message: 'Failed to create task' });
    }
});

app.get('/api/tasks', authenticate, async (req, res) => {
    try {
        const { userId } = req;

        const querySnapshot = await admin.firestore()
            .collection('tasks')
            .where('userId', '==', userId)
            .get();

        const tasks = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error(error)
    }
})

app.put('/api/tasks/:id', authenticate, async (req, res) => {
    try {
        const { userId } = req;
        const taskId = req.params.id;
        const { title, description } = req.body;

        const taskRef = admin.firestore().collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();
        if (!taskDoc.exists || taskDoc.data().userId !== userId) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const newData = {
            title: title || taskDoc.data().title,
            description: description || taskDoc.data().description,
        }
        // console.log(newData);

        await taskRef.update(newData);

        return res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({ message: 'Failed to update task' });
    }
});

// delete a task
app.delete('/api/tasks/:id', authenticate, async (req, res) => {
    try {
        const { userId } = req;
        const taskId = req.params.id;

        // Check if the task belongs to the user
        const taskRef = admin.firestore().collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();
        if (!taskDoc.exists || taskDoc.data().userId !== userId) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Delete the task document
        await taskRef.delete();

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ message: 'Failed to delete task' });
    }
});

exports.app = functions.https.onRequest(app);
