import { useEffect } from 'react';
import './App.css';
import Banner from './components/Banner';
import Category from './components/Category';
import FlashSale from './components/FlashSale';
import Header from './components/Header';
import BrandBanner from './components/BrandBanner';
import Blog from './components/Blog';
import BrandBanner2 from './components/BrandBanner2';
import Footer from './components/Footer';
import { useStore } from './hooks/useStore';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ModalAIReview from './components/ModalAIReview';

function App() {
    useEffect(() => {
        document.title = 'Trang chủ';
        AOS.init({
            duration: 1000,
            once: true,
            easing: 'ease',
            delay: 100,
        });
    }, []);

    const { categories } = useStore();

    return (
        <div>
            <header>
                <Header />
            </header>

            <main className="w-[80%] mx-auto mt-[70px] mb-10">
                <div className="mt-8" data-aos="fade-up">
                    <Banner categories={categories} />
                </div>
                <div data-aos="fade-up" data-aos-delay="200">
                    <FlashSale />
                </div>

                <div data-aos="fade-up" data-aos-delay="300">
                    {categories
                        .filter((item) => item.products.length > 0)
                        .map((item, index) => (
                            <div key={item.id} data-aos="fade-up" data-aos-delay={100 * (index + 1)}>
                                <Category data={item} />
                            </div>
                        ))}
                </div>

                <div data-aos="fade-up" data-aos-delay="400">
                    <BrandBanner />
                </div>

                <div data-aos="fade-up" data-aos-delay="500">
                    <BrandBanner2 />
                </div>

                <div data-aos="fade-up" data-aos-delay="600">
                    <Blog />
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;
