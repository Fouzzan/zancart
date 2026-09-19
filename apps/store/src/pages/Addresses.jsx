import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/react";
import { ArrowLeft, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  createAddress,
  deleteAddress,
  getUserAddresses,
  updateAddress,
} from "../services/addressServices";

function Addresses() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch user's addresses
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchAddresses = async () => {
      try {
        setLoading(true);

        const data = await getUserAddresses(user.id);
        setAddresses(data);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user, isLoaded]);

  // Open Add Address dialog
  const handleAdd = () => {
    setEditingAddress(null);

    reset({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      pinCode: "",
    });

    setOpen(true);
  };

  // Open Edit Address dialog
  const handleEdit = (address) => {
    setEditingAddress(address);

    reset({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      pinCode: address.pinCode,
    });

    setOpen(true);
  };

  // Add / Edit address
  const onSubmit = async (data) => {
    try {
      if (editingAddress) {
        const updatedAddress = await updateAddress(editingAddress.id, data);

        setAddresses((current) =>
          current.map((address) =>
            address.id === editingAddress.id ? updatedAddress : address,
          ),
        );

        toast.success("Address updated successfully.");
      } else {
        const newAddress = await createAddress({
          ...data,
          userId: user.id,
          isDefault: addresses.length === 0,
        });

        setAddresses((current) => [...current, newAddress]);

        toast.success("Address added successfully.");
      }

      setOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  // Delete address
  const handleDelete = async (addressId) => {
    try {
      await deleteAddress(addressId);

      setAddresses((current) =>
        current.filter((address) => address.id !== addressId),
      );

      toast.success("Address deleted successfully.");
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  // Make address default
  const handleSetDefault = async (addressId) => {
    try {
      const updatedAddresses = await Promise.all(
        addresses.map(async (address) => {
          const updatedAddress = {
            ...address,
            isDefault: address.id === addressId,
          };

          return updateAddress(address.id, updatedAddress);
        }),
      );

      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading addresses...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Address Management</h1>

            <p className="mt-2 text-muted-foreground">
              Manage your saved delivery addresses.
            </p>
          </div>

          <Button onClick={handleAdd} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <Input
                placeholder="Enter your full name"
                {...register("fullName", {
                  required: "Full name is required",
                })}
              />

              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>

              <Input
                type="tel"
                placeholder="Enter your phone number"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit phone number",
                  },
                })}
              />

              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium">Address</label>

              <Input
                placeholder="House name, street, etc."
                {...register("address", {
                  required: "Address is required",
                })}
              />

              {errors.address && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* City + PIN */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">City</label>

                <Input
                  placeholder="City"
                  {...register("city", {
                    required: "City is required",
                  })}
                />

                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  PIN Code
                </label>

                <Input
                  placeholder="PIN Code"
                  {...register("pinCode", {
                    required: "PIN code is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "Enter a valid 6-digit PIN code",
                    },
                  })}
                />

                {errors.pinCode && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.pinCode.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full">
              {editingAddress ? "Save Changes" : "Add Address"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center">
          <h2 className="text-xl font-semibold">No saved addresses</h2>

          <p className="mt-2 text-muted-foreground">
            Add an address to make checkout faster.
          </p>

          <Button onClick={handleAdd} className="mt-6 rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border p-6">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{address.fullName}</h2>

                  {address.isDefault && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </span>
                  )}
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{address.phone}</p>
                <p>{address.address}</p>
                <p>
                  {address.city} - {address.pinCode}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                  className="rounded-full"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  className="rounded-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>

                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="rounded-full"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Make Default
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Addresses;
