const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://akskokki:${password}@cluster0.wlgik7n.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url)

const PersonSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', PersonSchema)

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        result.forEach(note => {
            console.log(note)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(result => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
} else {
    console.log('invalid argument count')
    mongoose.connection.close()
}