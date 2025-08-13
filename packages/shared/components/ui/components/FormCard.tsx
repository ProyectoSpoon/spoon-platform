import React from 'react';
import { Card, CardHeader, CardContent, Button } from '@spoon/shared';
import { Pencil } from 'lucide-react';

interface FormCardProps {
  children: React.ReactNode;
  readOnly?: boolean;
  onToggleEdit?: () => void;
  className?: string;
  contentClassName?: string;
  hideHeaderEdit?: boolean;
}

export const FormCard: React.FC<FormCardProps> = ({ children, readOnly = false, onToggleEdit, className, contentClassName, hideHeaderEdit = false }) => {
  return (
    <Card className={className}>
      {readOnly && onToggleEdit && !hideHeaderEdit && (
        <CardHeader className="py-2">
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onToggleEdit}
              variant="outline"
              size="icon"
              aria-label="Editar"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
};

export default FormCard;
