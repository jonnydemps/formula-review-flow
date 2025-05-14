
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Briefcase, GraduationCap, ListChecks, Building } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const AboutUs: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-white to-blue-50 py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-ra-blue to-blue-600 bg-clip-text text-transparent">
              About SimplyRA
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              We provide expert regulatory affairs consulting for cosmetic and personal care products across Australia and New Zealand.
            </p>
          </div>
        </section>
        
        {/* Founder Bio Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-5 gap-12 items-center">
              {/* Image Column */}
              <div className="md:col-span-2">
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
                  <AspectRatio ratio={3/4}>
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center">
                      <div className="bg-white p-5 rounded-full shadow-md">
                        <Briefcase className="h-16 w-16 text-ra-blue" />
                      </div>
                    </div>
                  </AspectRatio>
                </div>
              </div>
              
              {/* Bio Column */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-ra-blue" />
                  <h2 className="text-2xl font-bold">John Dempsey</h2>
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-4">Founder & Principal Regulatory Consultant</h3>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    John Dempsey is a distinguished regulatory affairs expert with over 20 years of experience in the cosmetics and personal care industry. His extensive career spans roles at some of the world's leading beauty and personal care companies, including Johnson & Johnson, Beiersdorf, Revlon, and Unilever.
                  </p>
                  <p>
                    Throughout his career, John has specialized in navigating the complex regulatory landscapes of Australia and New Zealand, helping hundreds of brands bring their products to market safely and compliantly.
                  </p>
                  <p>
                    With a deep understanding of ingredient safety, product claims, labeling requirements, and compliance documentation, John founded SimplyRA to provide accessible regulatory expertise to companies of all sizes.
                  </p>
                  <p>
                    John holds advanced certifications in Cosmetic Safety Assessment and is an active member of the Australian Society of Cosmetic Chemists and the International Association for Regulatory Affairs Professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Experience Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Industry Experience</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Building className="text-ra-blue h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold">Corporate Experience</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Regulatory Affairs Director at Johnson & Johnson (2015-2020)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Senior Regulatory Manager at Beiersdorf (2010-2015)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Regulatory Specialist at Revlon (2005-2010)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Regulatory Affairs Associate at Unilever (2000-2005)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <GraduationCap className="text-ra-blue h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold">Expertise Areas</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Cosmetic Product Safety Assessments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Australian & New Zealand Regulatory Compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Formulation & Ingredient Review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Product Claims Validation & Substantiation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-ra-blue rounded-full mt-2"></span>
                    <span>Regulatory Strategy & Risk Assessment</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-ra-blue to-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to work with our expert team?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Let us help you navigate the complex world of regulatory compliance for your products.
            </p>
            <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
              <Link to="/sign-up">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
