// List of security questions for user registration
export const securityQuestions = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was your mother's maiden name?",
  "What was the name of your first school?",
  "What was your childhood nickname?",
  "What is your favorite book?",
  "What was the make of your first car?",
  "What is your favorite movie?",
  "What was the name of the street you grew up on?",
  "What is your favorite food?",
  "What was your first job?",
  "What is your favorite color?",
  "What is your favorite sport?",
  "What was the name of your first teacher?",
  "What is your favorite holiday?",
  "What was your childhood phone number?",
  "What is your favorite restaurant?",
  "What was your first concert?",
  "What is your favorite season?",
  "What was your childhood best friend's name?"
];

// Function to get a random security question (for testing)
export const getRandomSecurityQuestion = () => {
  return securityQuestions[Math.floor(Math.random() * securityQuestions.length)];
};

// Function to validate if a question is in the list
export const isValidSecurityQuestion = (question) => {
  return securityQuestions.includes(question);
}; 