"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import CardSidebar from "@/components/features/right-sidebar/CardSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { toast } from "sonner";
import axios from "axios";

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState('add');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchCards();
    fetchProjects();
  }, [pagination.page, searchTerm, selectedProjects]);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      let endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/cards`;
      const params = { 
        page: pagination.page, 
        limit: pagination.limit 
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedProjects.length > 0) {
        params.projectIds = selectedProjects.map(p => p.value).join(',');
      }
      
      const res = await axios.get(endpoint, {
        params,
        withCredentials: true,
      });
      
      setCards(res.data.rows || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.count || 0
      }));
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Failed to load cards");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojects`, {
        withCredentials: true,
      });
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCards();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleAction = async (card, type) => {
    setActionType(type);
    if (type === "edit" || type === "view") {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/card/${card.id}`, {
          withCredentials: true,
        });
        setSelectedCard(res.data.cardData || res.data.card);
      } catch (err) {
        toast.error("Failed to load card details");
        return;
      }
    } else {
      setSelectedCard(null);
    }
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setSelectedCard(null);
    setShowSidebar(false);
  };

  const handleCardSaved = () => {
    fetchCards();
    handleCloseSidebar();
  };

  const removeCardAssociations = async (cardId, projects) => {
    try {
      // Remove all project associations
      await Promise.all(
        projects.map(async (project) => {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/removeproject/${cardId}/${project.id}`,
            { withCredentials: true }
          );
        })
      );
    } catch (err) {
      console.error("Error removing associations:", err);
      throw err;
    }
  };

  const confirmDelete = async () => {
    try {
      const cardId = deleteId;
      const cardToDelete = cards.find(c => c.id === cardId);
      
      if (!cardToDelete) {
        toast.error("Card not found");
        return;
      }

      // First remove all project associations
      if (cardToDelete.projects?.length > 0) {
        await removeCardAssociations(
          cardId,
          cardToDelete.projects || []
        );
      }

      // Then delete the card itself
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deletecard`,
        { 
          withCredentials: true,
          data: { id: cardId }
        }
      );

      // Update local state
      setCards(prev => prev.filter(c => c.id !== cardId));
      toast.success("Card and all associations deleted successfully");
    } catch (err) {
      console.error("Error deleting card:", err);
      toast.error(
        err.response?.data?.message || 
        "Failed to delete card and associations"
      );
    } finally {
      setDeleteId(null);
    }
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesProjects = selectedProjects.length === 0 || 
      (card.projects?.some(p => selectedProjects.some(sp => sp.value === p.id.toString())));
    
    return matchesSearch && matchesProjects;
  });

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Card Resources</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Button 
          className="bg-green-600 text-white"
          onClick={() => handleAction(null, "add")}
        >
          Create New Card
        </Button>

        <div className="flex-1">
          <Input
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="space-y-2">
          <Label>Filter by Projects</Label>
          <MultiSelect
            options={projects.map(p => ({
              value: p.id.toString(),
              label: p.title || `Project ${p.id}`
            }))}
            value={selectedProjects}
            onChange={setSelectedProjects}
            placeholder="Select projects..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading cards...</div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {cards.length === 0 ? "No cards available" : "No cards match your filters"}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-3">ID</th>
                <th className="p-3">Icon</th>
                <th className="p-3">Title</th>
                <th className="p-3">Number</th>
                <th className="p-3">Suffix</th>
                <th className="p-3">Text</th>
                <th className="p-3">Projects</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Updated At</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{card.id}</td>
                  <td className="p-3">
                    {card.icon && (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${card.icon.replace(/\\/g, "/")}`}
                        alt={card.title || "Card icon"}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                  </td>
                  <td className="p-3">{card.title || "Untitled"}</td>
                  <td className="p-3">{card.number || "-"}</td>
                  <td className="p-3">{card.suffix || "-"}</td>
                  <td className="p-3">{card.text || "-"}</td>
                  <td className="p-3 max-w-xs">
                    {card.projects?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {card.projects.map(project => (
                          <span 
                            key={project.id} 
                            className="bg-gray-100 px-2 py-1 rounded text-xs"
                          >
                            {project.title || `Project ${project.id}`}
                          </span>
                        ))}
                      </div>
                    ) : "None"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(card.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleAction(card, "view")}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleAction(card, "edit")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setDeleteId(card.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center mt-6 gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <CardSidebar
        open={showSidebar}
        card={selectedCard}
        actionType={actionType}
        projects={projects}
        onClose={handleCloseSidebar}
        onSave={handleCardSaved}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Confirm Delete"
        description="Are you sure you want to delete this card and all its associations? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}