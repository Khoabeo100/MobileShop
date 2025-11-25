import { ArrowRight } from 'lucide-react';
import ProductCard from './Cardbody';
import { Link } from 'react-router-dom';

function Category({ data }) {
    return (
        <section className="mt-12">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 relative">
                <div className="flex items-center gap-1">
                    <div className="w-1 h-6 bg-red-500 mr-2"></div>
                    <h4 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                        {data.nameCategory}
                    </h4>
                </div>
                <Link to={`/category/${data.id}`}>
                    <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-all px-5 py-2 rounded-full text-white shadow-md hover:shadow-lg">
                        Xem tất cả
                        <ArrowRight size={18} />
                    </button>
                </Link>
            </div>

            {/* Product List */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-7">
                {data.products.map((item) => (
                    <div
                        key={item.id}
                        className="transform transition duration-300 hover:-translate-y-1 hover:scale-105"
                    >
                        <ProductCard data={item} />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Category;
