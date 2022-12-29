require('dotenv').config()
const express = require("express")
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('post-data', (req, res) => {
    if (req.method === "POST") return JSON.stringify(req.body)
    return null
})

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456",
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345",
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
    }
]

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>")
})

app.get("/api/persons", (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get("/api/persons/:id", (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get("/info", (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    let error_message;

    if (!body.name) error_message = 'name must not be blank'
    else if (!body.number) error_message = 'number must not be blank'
    // else if (persons.find(person => person.name === body.name)) error_message = 'name must be unique'

    if (error_message) {
        return res.status(400).json({
            error: error_message
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.delete("/api/persons/:id", (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedNote => {
            res.json(updatedNote)
        })
        .catch(error => next(error))
})


const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})