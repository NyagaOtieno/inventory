import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-500 font-bold">
            ×
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {footer && <div className="flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

// Axios instance
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://schooltransport-production.up.railway.app/api",
});

interface Bus {
  id: number;
  name: string;
  plateNumber: string;
}

interface Parent {
  id: number;
  user?: { name: string; phone: string };
}

interface School {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  grade: string;
  latitude?: number;
  longitude?: number;
  bus?: Bus;
  parent?: Parent;
  school?: School;
}

const Students: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    latitude: "",
    longitude: "",
    busId: "",
    parentId: "",
    schoolId: "",
  });

  // FETCH STUDENTS
  const { data, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await api.get("/students");
      return res.data.data as Student[];
    },
  });

  // CREATE / UPDATE STUDENT
  const saveStudent = useMutation({
    mutationFn: async (student: any) => {
      if (student.id) {
        const res = await api.put(`/students/${student.id}`, student);
        return res.data;
      } else {
        const res = await api.post("/students", student);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(
        `Student ${editingStudent ? "updated" : "added"} successfully`
      );
      setModalOpen(false);
      setEditingStudent(null);
      setFormData({
        name: "",
        grade: "",
        latitude: "",
        longitude: "",
        busId: "",
        parentId: "",
        schoolId: "",
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save student");
    },
  });

  // DELETE STUDENT
  const deleteStudent = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/students/${id}`);
      return res.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(`Student with ID ${id} deleted successfully`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete student");
    },
  });

  const openModalForEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      grade: student.grade || "",
      latitude: student.latitude?.toString() || "",
      longitude: student.longitude?.toString() || "",
      busId: student.bus?.id?.toString() || "",
      parentId: student.parent?.id?.toString() || "",
      schoolId: student.school?.id?.toString() || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStudent.mutate({
      id: editingStudent?.id,
      name: formData.name,
      grade: formData.grade,
      latitude: parseFloat(formData.latitude) || undefined,
      longitude: parseFloat(formData.longitude) || undefined,
      busId: formData.busId ? parseInt(formData.busId) : undefined,
      parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
      schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined,
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading students</p>;

  return (
    <div className="p-4">
      <Toaster position="top-right" />
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Students</h1>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setModalOpen(true);
          }}
        >
          Add Student
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Bus Name</TableHead>
            <TableHead>Bus Plate</TableHead>
            <TableHead>Parent Name</TableHead>
            <TableHead>Parent Phone</TableHead>
            <TableHead>School Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.grade}</TableCell>
              <TableCell>{student.bus?.name || "-"}</TableCell>
              <TableCell>{student.bus?.plateNumber || "-"}</TableCell>
              <TableCell>{student.parent?.user?.name || "-"}</TableCell>
              <TableCell>{student.parent?.user?.phone || "-"}</TableCell>
              <TableCell>{student.school?.name || "-"}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" onClick={() => openModalForEdit(student)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this student?"
                      )
                    ) {
                      deleteStudent.mutate(student.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? "Edit Student" : "Add Student"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingStudent ? "Update" : "Save"}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <Input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            name="grade"
            placeholder="Grade"
            value={formData.grade}
            onChange={handleChange}
            required
          />
          <Input
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleChange}
          />
          <Input
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleChange}
          />
          <Input
            name="busId"
            placeholder="Bus ID"
            value={formData.busId}
            onChange={handleChange}
          />
          <Input
            name="parentId"
            placeholder="Parent ID"
            value={formData.parentId}
            onChange={handleChange}
          />
          <Input
            name="schoolId"
            placeholder="School ID"
            value={formData.schoolId}
            onChange={handleChange}
          />
        </form>
      </Modal>
    </div>
  );
};

export default Students;
