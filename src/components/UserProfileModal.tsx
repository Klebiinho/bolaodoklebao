'use client';

import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Crop } from 'lucide-react';
import { updateProfile } from '@/app/actions/profile';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';

// Helper: Converter o crop pra imagem final
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  originalFile: File
): Promise<File> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Comprimir pra avatar (max 600x600)
  const MAX_WIDTH = 600;
  let finalWidth = canvas.width;
  let finalHeight = canvas.height;
  
  if (finalWidth > MAX_WIDTH) {
    const ratio = MAX_WIDTH / finalWidth;
    finalWidth = MAX_WIDTH;
    finalHeight = finalHeight * ratio;
  }
  
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = finalWidth;
  finalCanvas.height = finalHeight;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx?.drawImage(canvas, 0, 0, finalWidth, finalHeight);

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas vazio'));
      const newFileName = originalFile.name.replace(/\.[^/.]+$/, "") + ".jpg";
      resolve(new File([blob], newFileName, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.85);
  });
};

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const TEAMS = [
  // Países-sede (Classificados automaticamente)
  "Canadá", "Estados Unidos", "México",
  
  // Conmebol (América do Sul)
  "Argentina", "Brasil", "Uruguai", "Colômbia", "Equador", "Chile", "Peru", "Paraguai", "Venezuela", "Bolívia",
  
  // UEFA (Europa)
  "Alemanha", "França", "Inglaterra", "Espanha", "Itália", "Holanda", "Portugal", "Croácia", "Bélgica", "Suíça", "Dinamarca", "Suécia", "Polônia", "Sérvia", "País de Gales", "Áustria", "Ucrânia", "Turquia",
  
  // CAF (África)
  "Marrocos", "Senegal", "Nigéria", "Camarões", "Gana", "Egito", "Costa do Marfim", "Argélia", "Tunísia",
  
  // AFC (Ásia)
  "Japão", "Coreia do Sul", "Irã", "Arábia Saudita", "Austrália", "Catar",
  
  // CONCACAF (América do Norte/Central)
  "Costa Rica", "Panamá", "Jamaica"
].sort();

export function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentAvatar = user?.user_metadata?.avatar_url || '';
  const currentTeam = user?.user_metadata?.favorite_team || '';
  const currentName = user?.user_metadata?.full_name || '';

  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [favoriteTeam, setFavoriteTeam] = useState(currentTeam);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // States de Corte
  const [isCropping, setIsCropping] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  const supabase = createClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Inicia fluxo de crop
    const url = URL.createObjectURL(file);
    setRawFile(file);
    setRawImageUrl(url);
    setIsCropping(true);
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const confirmCrop = async () => {
    if (!rawImageUrl || !croppedAreaPixels || !rawFile) return;
    
    setLoading(true);
    try {
      const croppedFile = await getCroppedImg(rawImageUrl, croppedAreaPixels, rawFile);
      setSelectedFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(croppedFile));
      setIsCropping(false);
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao recortar imagem.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let finalAvatarUrl = avatarUrl;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Erro no upload: Certifique-se de que o bucket "avatars" existe e é público no Supabase. Detalhes: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      const formData = new FormData();
      formData.append('avatar_url', finalAvatarUrl);
      formData.append('favorite_team', favoriteTeam);

      const res = await updateProfile(formData);
      
      if (res.success) {
        toast({ title: 'Perfil atualizado!', description: 'Suas informações foram salvas com sucesso.' });
        onClose();
      } else {
        toast({ title: 'Erro ao salvar', description: res.error, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erro inesperado', description: err.message || 'Não foi possível salvar o perfil.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Tela unificada para evitar bugs de scroll/pointer lock do Radix Dialog
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-md flex flex-col ${isCropping ? 'h-[550px]' : ''}`}>
        
        {isCropping && rawImageUrl ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline uppercase tracking-wider">Recortar Imagem</DialogTitle>
              <DialogDescription>Arraste para ajustar o enquadramento perfeito.</DialogDescription>
            </DialogHeader>
            
            <div className="relative flex-1 bg-black/10 rounded-xl overflow-hidden mt-4 mb-2">
              <Cropper
                image={rawImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="px-4 py-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Zoom</Label>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(val) => setZoom(val[0])}
              />
            </div>

            <DialogFooter className="mt-auto pt-4">
              <Button variant="ghost" onClick={() => setIsCropping(false)} disabled={loading} className="text-xs uppercase">
                Voltar
              </Button>
              <Button onClick={confirmCrop} disabled={loading} className="text-xs uppercase bg-primary text-white">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crop className="w-4 h-4 mr-2" />}
                Cortar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline uppercase tracking-wider">Meu Perfil</DialogTitle>
              <DialogDescription>Personalize sua conta adicionando uma foto e escolhendo seu time do coração.</DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-2 border-border shadow-sm">
              <AvatarImage src={previewUrl || avatarUrl} />
              <AvatarFallback className="text-2xl font-bold bg-secondary text-muted-foreground">
                {currentName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex gap-2">
              <input 
                id="avatar-upload"
                name="avatar-upload"
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-[10px] uppercase tracking-widest font-bold border-border/50 bg-secondary hover:bg-secondary/80"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3 h-3 mr-2" />
                Carregar Imagem
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ou Cole a URL da Foto</Label>
            <Input 
              id="avatarUrl" 
              placeholder="https://exemplo.com/suafoto.jpg" 
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
              className="h-10 bg-secondary border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Seleção do Coração</Label>
            <Select value={favoriteTeam} onValueChange={setFavoriteTeam}>
              <SelectTrigger className="h-10 bg-secondary border-border/50">
                <SelectValue placeholder="Selecione uma seleção..." />
              </SelectTrigger>
              <SelectContent>
                {TEAMS.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-xs uppercase tracking-widest">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading} className="text-xs uppercase tracking-widest">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Salvar
          </Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
