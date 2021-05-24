const express = require('express')
const Queue = require('bull');
const nodemailer = require('nodemailer');
const QueueMQ = require('bullmq')
const { createBullBoard } = require('bull-board')
const { BullAdapter } = require('bull-board/bullAdapter')
const { BullMQAdapter } = require('bull-board/bullMQAdapter')
const port = 3000;

const someQueue = new Queue('someQueueName')
const someOtherQueue = new Queue('someOtherQueueName')
    //const queueMQ = new QueueMQ('queueMQName')

// const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard([
//     new BullAdapter(someQueue),
//     new BullAdapter(someOtherQueue),
//     new BullMQAdapter(queueMQ),
// ])


const app = express()



// 1. Initiating the Queue
const sendMailQueue = new Queue('sendMail', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
        password: 'root'
    }
});
const data = {
    email: 'userid@domain.com'
};

const options = {
    delay: 60000, // 1 min in ms
    attempts: 2
};

// 2. Adding a Job to the Queue
sendMailQueue.add(data, options);

// 3. Consumer
sendMailQueue.process(async job => {
    return await sendMail(job.data.email);
});

function sendMail(email) {
    return new Promise((resolve, reject) => {
        let mailOptions = {
            from: 'fromuser@domain.com',
            to: email,
            subject: 'Bull - npm',
            text: "This email is from bull job scheduler tutorial.",
        };
        let mailConfig = {
            service: 'gmail',
            auth: {
                user: 'fromuser@domain.com',
                pass: 'mail_password_here'
            }
        };
        nodemailer.createTransport(mailConfig).sendMail(mailOptions, (err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
}

const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard([
    new BullAdapter(someQueue),
    new BullAdapter(someOtherQueue),
    new BullAdapter(sendMailQueue)
])

app.use('/admin/queues', router)

app.use('/sample', function(req, res) {

    res.send("Inside sample");
})

app.post('/sample', function(req, res) {

    res.send("Inside sample");
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})