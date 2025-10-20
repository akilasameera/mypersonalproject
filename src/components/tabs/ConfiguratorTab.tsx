import React, { useState, useEffect } from 'react';
import { Upload, Save, Loader, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ConfiguratorBlock } from '../../types';

interface ConfiguratorTabProps {
  projectId: string;
  isMasterProject: boolean;
}

const DEFAULT_BLOCK_NAMES = [
  'BOM Preferences',
  'Shifts',
  'Labor Codes',
  'Production Preferences',
  'Production Preferences Branch',
  'Production Order Type',
  'Production Labor codes',
  'Inventory Planning Preferences',
  'MPS Type',
  'Inventory Planning Bucket',
  'Estimate Preferences',
  'Estimate Classes',
  'Configurator Preferences',
  'Features'
];

const ConfiguratorTab: React.FC<ConfiguratorTabProps> = ({ projectId, isMasterProject }) => {
  const [blocks, setBlocks] = useState<ConfiguratorBlock[]>([]);
  const [configurationId, setConfigurationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBlock, setUploadingBlock] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    loadConfiguration();
  }, [projectId]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);

      let { data: config, error: configError } = await supabase
        .from('project_configurations')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (configError) throw configError;

      if (!config) {
        const { data: newConfig, error: createError } = await supabase
          .from('project_configurations')
          .insert({
            project_id: projectId,
            is_master: isMasterProject,
            brd_content: ''
          })
          .select()
          .single();

        if (createError) throw createError;
        config = newConfig;
      }

      setConfigurationId(config.id);

      const { data: blocksData, error: blocksError } = await supabase
        .from('configurator_blocks')
        .select('*')
        .eq('configuration_id', config.id)
        .order('block_order');

      if (blocksError) throw blocksError;

      let masterBlocks: any[] = [];
      if (!isMasterProject) {
        const { data: masterProject } = await supabase
          .from('projects')
          .select('id, title')
          .ilike('title', 'master')
          .maybeSingle();

        if (masterProject) {
          const { data: masterConfig } = await supabase
            .from('project_configurations')
            .select('id')
            .eq('project_id', masterProject.id)
            .maybeSingle();

          if (masterConfig) {
            const { data: masterBlocksData } = await supabase
              .from('configurator_blocks')
              .select('*')
              .eq('configuration_id', masterConfig.id)
              .order('block_order');

            if (masterBlocksData) {
              masterBlocks = masterBlocksData;
            }
          }
        }
      }

      if (!blocksData || blocksData.length === 0) {
        const newBlocks = DEFAULT_BLOCK_NAMES.map((name, index) => {
          const masterBlock = masterBlocks.find(mb => mb.block_order === (index + 1));

          return {
            configuration_id: config.id,
            block_name: name,
            block_order: index + 1,
            text_content: masterBlock?.text_content || '',
            image_url: masterBlock?.image_url || null,
            image_name: masterBlock?.image_name || null,
            image_size: masterBlock?.image_size || null,
            is_read_only: !!(masterBlock?.image_url || masterBlock?.text_content),
            source_block_id: masterBlock?.id || null
          };
        });

        const { data: createdBlocks, error: createBlocksError } = await supabase
          .from('configurator_blocks')
          .insert(newBlocks)
          .select();

        if (createBlocksError) throw createBlocksError;

        setBlocks(createdBlocks.map(block => ({
          id: block.id,
          configurationId: block.configuration_id,
          blockName: block.block_name,
          blockOrder: block.block_order,
          imageUrl: block.image_url,
          imageName: block.image_name,
          imageSize: block.image_size,
          textContent: block.text_content,
          isReadOnly: block.is_read_only,
          sourceBlockId: block.source_block_id,
          createdAt: block.created_at,
          updatedAt: block.updated_at
        })));
      } else {
        // Update existing blocks with master data
        const blocksWithMasterData = blocksData.map(block => {
          // Try to find master block by source_block_id first, then by block_order
          let masterBlock = null;
          if (block.source_block_id) {
            masterBlock = masterBlocks.find(mb => mb.id === block.source_block_id);
          }
          if (!masterBlock) {
            masterBlock = masterBlocks.find(mb => mb.block_order === block.block_order);
          }

          if (masterBlock && (masterBlock.image_url || masterBlock.text_content)) {
            return {
              ...block,
              image_url: masterBlock.image_url || block.image_url,
              image_name: masterBlock.image_name || block.image_name,
              image_size: masterBlock.image_size || block.image_size,
              text_content: block.is_read_only ? (masterBlock.text_content || block.text_content) : block.text_content,
              is_read_only: block.is_read_only || !!(masterBlock.image_url || masterBlock.text_content),
              source_block_id: block.source_block_id || masterBlock.id
            };
          }
          return block;
        });

        setBlocks(blocksWithMasterData.map(block => ({
          id: block.id,
          configurationId: block.configuration_id,
          blockName: block.block_name,
          blockOrder: block.block_order,
          imageUrl: block.image_url,
          imageName: block.image_name,
          imageSize: block.image_size,
          textContent: block.text_content,
          isReadOnly: block.is_read_only,
          sourceBlockId: block.source_block_id,
          createdAt: block.created_at,
          updatedAt: block.updated_at
        })));
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (blockId: string, blockOrder: number, file: File) => {
    try {
      setUploadingBlock(blockOrder);

      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${blockId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('configurator-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('configurator-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('configurator_blocks')
        .update({
          image_url: publicUrl,
          image_name: file.name,
          image_size: file.size,
          updated_at: new Date().toISOString()
        })
        .eq('id', blockId);

      if (updateError) throw updateError;

      setBlocks(prev => prev.map(block =>
        block.id === blockId
          ? { ...block, imageUrl: publicUrl, imageName: file.name, imageSize: file.size }
          : block
      ));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingBlock(null);
    }
  };

  const handleTextChange = (blockId: string, text: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? { ...block, textContent: text } : block
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const editableBlocks = blocks.filter(block => !block.isReadOnly);
      const updates = editableBlocks.map(block => ({
        id: block.id,
        text_content: block.textContent,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('configurator_blocks')
          .update(update)
          .eq('id', update.id);

        if (error) throw error;
      }

      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('configurator_blocks')
        .update({
          image_url: null,
          image_name: null,
          image_size: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', blockId);

      if (error) throw error;

      setBlocks(prev => prev.map(block =>
        block.id === blockId
          ? { ...block, imageUrl: undefined, imageName: undefined, imageSize: undefined }
          : block
      ));
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configurator</h2>
                <p className="text-sm text-gray-600">
                  {isMasterProject ? 'Master template for all projects' : (
                    <>
                      Project-specific configuration
                      {blocks.filter(b => b.isReadOnly).length > 0 && (
                        <span className="ml-2 text-blue-600 font-semibold">
                          ({blocks.filter(b => b.isReadOnly).length} blocks from Master)
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {blocks.map((block) => (
              <div key={block.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">
                      {block.blockOrder}. {block.blockName}
                    </h3>
                    {block.isReadOnly && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        From Master (Read Only)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Image Preview {!isMasterProject && <span className="text-xs text-gray-500">(From Master Template)</span>}
                    </label>
                    {block.imageUrl ? (
                      <div className="relative group">
                        <img
                          src={block.imageUrl}
                          alt={block.blockName}
                          onClick={() => setSelectedImage({ url: block.imageUrl!, title: block.blockName })}
                          className="w-full h-[32rem] object-contain bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                        {isMasterProject && (
                          <button
                            onClick={() => handleRemoveImage(block.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        {!isMasterProject && (
                          <div className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg shadow-lg">
                            Master Template
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {isMasterProject ? (
                          <label className="flex flex-col items-center justify-center h-[32rem] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-gray-50">
                            {uploadingBlock === block.blockOrder ? (
                              <Loader className="w-12 h-12 animate-spin text-blue-500" />
                            ) : (
                              <>
                                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                                <span className="text-base font-medium text-gray-600">Click to upload image</span>
                                <span className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(block.id, block.blockOrder, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[32rem] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                            <span className="text-base font-medium text-gray-600">No image set in Master</span>
                            <span className="text-sm text-gray-500 mt-2">Upload image in Master project</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Configuration Details
                      {block.isReadOnly && (
                        <span className="ml-2 text-xs text-blue-600 font-normal">(Read Only - from Master Template)</span>
                      )}
                    </label>
                    <textarea
                      value={block.textContent}
                      onChange={(e) => !block.isReadOnly && handleTextChange(block.id, e.target.value)}
                      placeholder={block.isReadOnly ? 'This content is from Master template and cannot be edited' : `Enter configuration details for ${block.blockName}...`}
                      disabled={block.isReadOnly}
                      className={`w-full h-[32rem] px-4 py-3 border rounded-lg resize-none text-sm ${
                        block.isReadOnly
                          ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed'
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg shadow-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="bg-white rounded-lg p-4 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedImage.title}</h3>
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguratorTab;
