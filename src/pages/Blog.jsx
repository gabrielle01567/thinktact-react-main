import { useState } from 'react';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Sample blog categories
  const categories = ['All', 'Logical Fallacies', 'Critical Thinking', 'Argument Analysis', 'Cognitive Biases'];
  
  // Sample blog posts
  const blogPosts = [
    {
      id: 1,
      title: 'Understanding Strawman Arguments',
      excerpt: 'How to identify and avoid this common logical fallacy in debates and discussions.',
      date: 'June 15, 2024',
      category: 'Logical Fallacies',
      readTime: '6 min read',
    },
    {
      id: 2,
      title: 'The Role of Necessary Assumptions in Strong Arguments',
      excerpt: 'Learn how to identify the hidden assumptions that make or break an argument.',
      date: 'June 8, 2024',
      category: 'Argument Analysis',
      readTime: '8 min read',
    },
    {
      id: 3,
      title: 'How Confirmation Bias Affects Our Reasoning',
      excerpt: 'Explore how our tendency to favor information that confirms our beliefs impacts our ability to reason.',
      date: 'May 22, 2024',
      category: 'Cognitive Biases',
      readTime: '5 min read',
    },
    {
      id: 4,
      title: 'Developing Clear Premises for Sound Arguments',
      excerpt: 'Tips for constructing clear, precise premises that lead to strong conclusions.',
      date: 'May 15, 2024',
      category: 'Argument Analysis',
      readTime: '7 min read',
    },
    {
      id: 5,
      title: 'Asking Better Questions: The Foundation of Critical Thinking',
      excerpt: 'How the questions we ask shape the answers we get and the quality of our thinking.',
      date: 'May 3, 2024',
      category: 'Critical Thinking',
      readTime: '6 min read',
    },
  ];
  
  // Filter posts by selected category
  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-pink-950 sm:text-4xl">ThinkTactAI Blog</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Insights, tips, and deep dives into critical thinking and argument analysis.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
                <ul className="space-y-2">
                  {categories.map(category => (
                    <li key={category}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className={`text-left w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          selectedCategory === category
                            ? 'bg-pink-950 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Subscribe</h2>
                  <p className="text-gray-600 mb-4">Get the latest posts delivered right to your inbox.</p>
                  <div className="mt-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-900 focus:ring-pink-900 sm:text-sm"
                    />
                    <button className="mt-3 w-full rounded-md bg-pink-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-900">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Blog posts */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {selectedCategory === 'All' ? 'Latest Posts' : selectedCategory}
              </h2>
              
              <div className="space-y-12">
                {filteredPosts.map(post => (
                  <article key={post.id} className="border-b border-gray-200 pb-10">
                    <div className="mb-4 text-sm">
                      <span className="text-pink-900 font-medium">{post.category}</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-gray-500">{post.date}</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-gray-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <a href="#" className="inline-flex items-center text-pink-900 font-medium hover:text-pink-950">
                      Read more
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </a>
                  </article>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="mt-12 flex justify-between items-center">
                <button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <div className="flex space-x-2">
                  <button className="rounded-md bg-pink-950 px-3 py-2 text-sm font-medium text-white">1</button>
                  <button className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">2</button>
                  <button className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">3</button>
                </div>
                <button className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog; 