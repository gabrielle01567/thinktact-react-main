import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-pink-950 sm:text-4xl">About ThinkTactAI</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            ThinkTact.ai exists to leverage clarity. In an era of noise, manipulation, and intellectual overload,
            we give individuals and professionals the tools to cut through the fog—to see the structure behind persuasion,
            the logic beneath language, and the strategic implications within every idea.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Our Purpose</h2>
              <div className="mt-4 text-gray-600 space-y-4">
                <p>
                  ThinkTactAI was created to help people navigate the increasingly complex information environment 
                  we all face. In a world where arguments are often designed to manipulate rather than inform, 
                  we need tools that can help us see through rhetoric to the underlying logical structure.
                </p>
                <p>
                  We believe that by breaking down arguments into their component parts and analyzing them objectively, 
                  we can help people make more informed decisions and engage in more productive discourse.
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">What Our Tool Does</h2>
              <div className="mt-4 text-gray-600 space-y-4">
                <p>
                  ThinkTactAI uses advanced AI techniques to analyze arguments and break them down into their logical components. 
                  Our system identifies:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The basic logical structure of an argument (If-Then statements)</li>
                  <li>Necessary and sufficient assumptions</li>
                  <li>The type of conclusion being made</li>
                  <li>Unstated rules that underpin the argument</li>
                  <li>Methods of reasoning being employed</li>
                  <li>Potential logical flaws</li>
                  <li>Use of quantifiers</li>
                  <li>Premise sets, both explicit and implicit</li>
                </ul>
                <p>
                  We also generate thoughtful counterpoints to help users see multiple perspectives on an issue.
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Why This Matters</h2>
              <div className="mt-4 text-gray-600 space-y-4">
                <p>
                  In today's information environment, we're bombarded with persuasive messaging designed to influence our 
                  opinions and behaviors. Social media algorithms, political campaigns, marketing strategies, and media 
                  outlets all employ sophisticated persuasion techniques.
                </p>
                <p>
                  By developing our ability to analyze arguments critically, we can:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Make more informed decisions based on sound reasoning</li>
                  <li>Identify manipulation attempts and logical fallacies</li>
                  <li>Engage in more productive discourse with others</li>
                  <li>Develop stronger arguments for our own positions</li>
                </ul>
                <p>
                  ThinkTactAI is designed to be a partner in this process, helping you navigate complex arguments and 
                  develop your own critical thinking skills.
                </p>
              </div>
            </div>
            
            <div className="text-center pt-6">
              <Link
                to="/analyzer"
                className="rounded-md bg-pink-950 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-pink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-950"
              >
                Try the Analyzer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 