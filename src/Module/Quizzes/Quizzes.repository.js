const Quiz = require('../../DB/Models/Quiz.model');

class QuizzesRepository {
  async create(data) {
    return await Quiz.create(data);
  }

  async findAll(filter = {}) {
    return await Quiz.find(filter).populate('lesson_id', 'title topic');
  }

  async findById(id) {
    return await Quiz.findById(id).populate('lesson_id', 'title topic');
  }

  async update(id, data) {
    return await Quiz.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Quiz.findByIdAndDelete(id);
  }
}

module.exports = new QuizzesRepository();
