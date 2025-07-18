import { useQuery } from "@tanstack/react-query";
import { FileText, Users, Search, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

export default function StatsSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos no cache
    refetchInterval: 2 * 60 * 1000, // Atualizar a cada 2 minutos
    refetchIntervalInBackground: false, // NÃO atualizar sem foco na aba
  });

  const statsConfig = [
    {
      icon: FileText,
      value: stats?.documentos || 0,
      label: "Documentos",
      color: "text-brand-blue",
      bgColor: "bg-blue-100",
    },
    {
      icon: Users,
      value: stats?.visitantes || 0,
      label: "Visitas",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Search,
      value: stats?.busca || 0,
      label: "Buscas",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Download,
      value: stats?.downloads || 0,
      label: "Downloads",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mx-auto mb-3 sm:mb-4" />
            <Skeleton className="h-3 sm:h-4 w-56 sm:w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4" />
                <Skeleton className="h-6 sm:h-7 md:h-8 w-12 sm:w-14 md:w-16 mx-auto mb-2" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-18 md:w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">Sistema em Números</h2>
          <p className="text-base sm:text-lg text-slate-custom px-4">
            Acompanhe o crescimento e a evolução do nosso acervo
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${stat.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <Icon className={`${stat.color}`} size={20} />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {formatNumber(stat.value)}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-slate-custom">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
