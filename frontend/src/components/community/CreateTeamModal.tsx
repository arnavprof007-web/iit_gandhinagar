import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

const createTeamSchema = z.object({
  name: z.string().min(3, 'Squad name must have at least 3 characters').max(50),
  city: z.string().min(2, 'City is required'),
  type: z.enum(['neighbourhood', 'college', 'workplace']),
  description: z.string().min(10, 'Please provide a short description (min 10 characters)').max(200),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTeam: (data: CreateTeamFormData) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onCreateTeam,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      city: 'Gandhinagar',
      type: 'neighbourhood',
      description: '',
    },
  });

  const onSubmit = (data: CreateTeamFormData) => {
    onCreateTeam(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Sustainability Squad">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Squad Name"
          placeholder="e.g. Sector 21 Solar & Compost Club"
          {...register('name')}
          error={errors.name?.message}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="Gandhinagar"
            {...register('city')}
            error={errors.city?.message}
            required
          />

          <Select
            label="Squad Type"
            {...register('type')}
            options={[
              { value: 'neighbourhood', label: 'Neighbourhood' },
              { value: 'college', label: 'College / University' },
              { value: 'workplace', label: 'Workplace' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mission LiFE Focus & Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
            placeholder="Describe your squad's goals (e.g. rooftop solar adoption, carpooling, plastic cleanups)..."
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.description.message}</p>
          )}
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Launch Squad
          </Button>
        </div>
      </form>
    </Modal>
  );
};
