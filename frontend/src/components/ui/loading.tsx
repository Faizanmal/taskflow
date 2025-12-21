'use client';

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
