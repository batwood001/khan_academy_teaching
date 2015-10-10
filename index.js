var request = require('request');
var _ = require('lodash');
var prompt = require('prompt');

var topic = 'linear-algebra';

var requestTopic = function(topic) {
  request('http://www.khanacademy.org/api/v1/topic/' + topic, function(err, res, body) {
    var parsedBody = JSON.parse(body);
    if (hasSubTopics(parsedBody)) {
      renderBodyInfo(parsedBody);
      prompt.start();
      prompt.get(['subtopic'], function(err, choice) {
        var subTopic = parsedBody.children[choice.subtopic - 1].node_slug;
        requestTopic(subTopic);
      });
    } else {
      prompt.start();
      console.log('Who is teaching? Separate names with commas.');
      prompt.get(['teachers'], function(err, choice) {
        var teachers = _.words(choice.teachers);
        var concepts = _.map(parsedBody.children, function(child) {
          return child.title;
        });
        var plans = generateLessonPlans(teachers, concepts);
        renderLessonPlans(plans);
      });
    }
  });
};

function hasSubTopics(body) {
  return _.every(body.child_data, function(child) {
    return child.kind === 'Topic';
  });
}

function generateLessonPlans(teachers, concepts) {
  var shuffledConcepts = _.shuffle(concepts);
  var numTeachers = teachers.length;
  return _.map(teachers, function(teacher, i) {
    return {
      name: teacher,
      lessons: _.chunk(shuffledConcepts, concepts.length / teachers.length)[i]
    };
  });
}

function renderLessonPlans(lessonPlans) {
  _.forEach(lessonPlans, function(plan) {
    console.log(plan.name, 'is teaching:');
    _.forEach(plan.lessons, function(lesson) {
      console.log(' ', lesson);
    });
  });
}

function renderBodyInfo(parsedBody) {
  console.log('Topic:', parsedBody.title);
  console.log('Choose a sub-topic:');
  _.forEach(parsedBody.children, function(child, i) {
    console.log(' ', i + 1, child.title);
  });
}

requestTopic(topic);