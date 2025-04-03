import { Link } from 'react-router-dom';

const Blog = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-pink-950 sm:text-4xl">ThinkTactAI Blog</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Insights and research on critical thinking and argument analysis.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="space-y-20">
            <article className="relative isolate flex flex-col gap-8 lg:flex-row">
              <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                <img
                  src="/images/manifesto-cover.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
              </div>
              <div>
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime="2024-04" className="text-gray-500">April 2024</time>
                  <Link to="/research/clarity-infrastructure" className="relative z-10 rounded-full bg-pink-50 px-3 py-1.5 font-medium text-pink-900">
                    Research
                  </Link>
                </div>
                <div className="group relative max-w-xl">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <Link to="/research/clarity-infrastructure">
                      <span className="absolute inset-0" />
                      Why We're Rebuilding the Logic Layer of the Web
                    </Link>
                  </h3>
                  <p className="mt-5 text-sm leading-6 text-gray-600">
                    Introducing our manifesto on clarity as infrastructure. We're building a protocol for logic, not merely language, to address the epistemic breakdown in digital discourse.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog; 