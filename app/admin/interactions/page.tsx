'use client';

import { useEffect, useState, useCallback, ChangeEvent } from 'react'; // Add useCallback and ChangeEvent
import { Product } from '@prisma/client'; // Revert back to standard import
import { HandThumbUpIcon, HandThumbDownIcon, MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'; // Add more icons
import Image from 'next/image';
// Input might not be needed for now
import { Select } from '@/app/components/ui/select'; // Import only the existing Select component
// Remove unnecessary type alias
// type Product = Prisma.Product;

// Define a type for the interaction data we expect from the API
interface Interaction {
  id: number;
  productId: number;
  interactionType: 'LIKE' | 'DISLIKE';
  createdAt: string; // Dates usually come as strings from JSON
  product: {
    id: number;
    name: string;
    image?: string | null; // Include image from API response
  };
}

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedResult[]>([]); // State for aggregated data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // State to hold products for filtering dropdown
  const [viewMode, setViewMode] = useState<'individual' | 'aggregated'>('individual'); // State for view mode

  // State for filters and sorting
  const [filterProductId, setFilterProductId] = useState<string>('');
  const [filterInteractionType, setFilterInteractionType] = useState<'LIKE' | 'DISLIKE' | ''>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch products for the filter dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=1000'); // Fetch all products (consider pagination if many)
        if (response.ok) {
          const data = await response.json();
          const productsArray = data.products || (Array.isArray(data) ? data : []);
          setProducts(productsArray);
        }
      } catch (err) {
        console.error("Failed to fetch products for filter:", err);
        // Handle error appropriately, maybe show a toast
      }
    };
    fetchProducts();
  }, []);


  // --- Start of component function scope ---

  // Define the structure for the aggregated data (matching API response)
  type AggregatedResult = {
    productId: number;
    productName: string;
    productImage: string | null | undefined;
    likeCount: number;
    dislikeCount: number;
    totalInteractions: number;
  };


  // Use useCallback to memoize fetchInteractions
  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Reset error on new fetch

      // Construct query parameters
      const params = new URLSearchParams();

      if (viewMode === 'aggregated') {
         params.append('groupBy', 'product');
         // Aggregated view doesn't use other filters/sorts for now
      } else {
        // Individual view uses filters/sorts
        if (filterProductId) params.append('productId', filterProductId);
        if (filterInteractionType) params.append('interactionType', filterInteractionType);
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
      }


      const response = await fetch(`/api/products/interactions?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Etkileşimler yüklenirken bir hata oluştu');
      }
      const result = await response.json(); // API now returns { type: '...', data: [...] }

      if (result.type === 'aggregated') {
        setAggregatedData(result.data as AggregatedResult[]);
        setInteractions([]); // Clear individual interactions when showing aggregated
      } else {
        setInteractions(result.data as Interaction[]);
        setAggregatedData([]); // Clear aggregated data when showing individual
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
      setInteractions([]); // Clear data on error
      setAggregatedData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [viewMode, filterProductId, filterInteractionType, sortBy, sortOrder]); // Add viewMode to dependencies

  // useEffect to call fetchInteractions when dependencies change
  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]); // Dependency is the memoized function itself

  // Helper to toggle sort order
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending when changing field
    }
  };

  // Helper component for sort icons
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1 inline" /> : <ArrowDownIcon className="h-4 w-4 ml-1 inline" />;
  };

  return ( // Component return starts here
  // --- End of component function scope corrections ---
    <div className="container mx-auto px-4 py-8">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ürün Etkileşimleri</h1>
         {/* View Mode Toggle */}
         <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'individual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tekil Etkileşimler
            </button>
            <button
              onClick={() => setViewMode('aggregated')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                viewMode === 'aggregated'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Özet İstatistikler
            </button>
         </div>
       </div>


      {/* Filter Controls (Only show for individual view) */}
      {viewMode === 'individual' && (
         <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter by Product */}
          <div>
            <label htmlFor="productFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ürüne Göre Filtrele
            </label>
            {/* Use standard HTML select */}
            <Select
              id="productFilter"
              value={filterProductId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterProductId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tüm Ürünler</option>
              {products.map((product) => (
                <option key={product.id} value={product.id.toString()}>
                  {product.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Filter by Interaction Type */}
          <div>
            <label htmlFor="interactionTypeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Etkileşim Türüne Göre Filtrele
            </label>
             {/* Use standard HTML select */}
            <Select
              id="interactionTypeFilter"
              value={filterInteractionType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterInteractionType(e.target.value as 'LIKE' | 'DISLIKE' | '')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tümü</option>
              <option value="LIKE">Beğeni</option>
              <option value="DISLIKE">Beğenmeme</option>
            </Select>
          </div>

          {/* Sort Controls could be added here if needed, but table headers handle it now */}

        </div>
         </div>
      )}


      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Yükleniyor...</p>
          {/* Optional: Add a spinner */}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Hata!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Display Individual Interactions Table */}
      {viewMode === 'individual' && !loading && !error && interactions.length === 0 && (
         <div className="text-center py-10">
           <p className="text-gray-500 dark:text-gray-400">Filtreye uygun etkileşim bulunmuyor.</p>
         </div>
      )}
      {viewMode === 'individual' && !loading && !error && interactions.length > 0 && (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg bg-white dark:bg-gray-800">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('productName')}>
                  Ürün <SortIcon field="productName" />
                </th>
                <th scope="col" className="py-3 px-6">Etkileşim</th>
                <th scope="col" className="py-3 px-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('createdAt')}>
                  Zaman <SortIcon field="createdAt" />
                </th>
              </tr>
            </thead>
            <tbody>
              {interactions.map((interaction) => (
                <tr key={interaction.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white flex items-center space-x-3">
                    {interaction.product.image ? (
                       <Image
                         src={interaction.product.image}
                         alt={interaction.product.name}
                         width={40} // Adjust size as needed
                         height={40}
                         className="w-10 h-10 rounded object-cover" // Added object-cover
                         unoptimized // If using external URLs or Base64
                       />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">?</div>
                    )}
                    <span>{interaction.product.name}</span>
                  </th>
                  <td className="py-4 px-6">
                    {interaction.interactionType === 'LIKE' ? (
                      <span className="flex items-center text-green-500">
                        <HandThumbUpIcon className="h-5 w-5 mr-1" /> Beğeni
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500">
                        <HandThumbDownIcon className="h-5 w-5 mr-1" /> Beğenmeme
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {new Date(interaction.createdAt).toLocaleString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
      )}

       {/* Display Aggregated Stats Table */}
       {viewMode === 'aggregated' && !loading && !error && aggregatedData.length === 0 && (
         <div className="text-center py-10">
           <p className="text-gray-500 dark:text-gray-400">Henüz özetlenecek etkileşim bulunmuyor.</p>
         </div>
       )}
       {viewMode === 'aggregated' && !loading && !error && aggregatedData.length > 0 && (
         <div className="overflow-x-auto relative shadow-md sm:rounded-lg bg-white dark:bg-gray-800">
           <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
               <tr>
                 <th scope="col" className="py-3 px-6">Ürün</th>
                 <th scope="col" className="py-3 px-6 text-center">Beğeni Sayısı</th>
                 <th scope="col" className="py-3 px-6 text-center">Beğenmeme Sayısı</th>
                 <th scope="col" className="py-3 px-6 text-center">Toplam Etkileşim</th>
               </tr>
             </thead>
             <tbody>
               {aggregatedData.map((item) => (
                 <tr key={item.productId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                   <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white flex items-center space-x-3">
                     {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded object-cover"
                          unoptimized
                        />
                     ) : (
                       <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">?</div>
                     )}
                     <span>{item.productName}</span>
                   </th>
                   <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-medium">{item.likeCount}</td>
                   <td className="py-4 px-6 text-center text-red-600 dark:text-red-400 font-medium">{item.dislikeCount}</td>
                   <td className="py-4 px-6 text-center font-semibold">{item.totalInteractions}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}

    </div>
  );
}